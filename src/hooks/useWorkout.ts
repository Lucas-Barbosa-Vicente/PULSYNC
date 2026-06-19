'use client'

import { useState, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Workout, RoutePoint } from '@/types/database.types'
import { WORKOUT_TYPES } from '@/constants/theme'

function haversine(p1: RoutePoint, p2: RoutePoint): number {
  const R = 6371000
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(p2.lat - p1.lat)
  const dLng = toRad(p2.lng - p1.lng)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(p1.lat)) * Math.cos(toRad(p2.lat)) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function estimateCalories(type: string, durationMin: number, weightKg = 70): number {
  const wt = WORKOUT_TYPES.find((t) => t.id === type)
  const met = wt?.metValue ?? 5
  return Math.round(met * weightKg * (durationMin / 60))
}

export function useWorkout() {
  const supabase = createClient()

  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [isActive, setIsActive] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [distanceMeters, setDistanceMeters] = useState(0)
  const [routePoints, setRoutePoints] = useState<RoutePoint[]>([])

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const watchRef = useRef<number | null>(null)
  const lastPointRef = useRef<RoutePoint | null>(null)

  const fetchWorkoutHistory = useCallback(
    async (userId: string, limit = 20) => {
      const { data } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', userId)
        .order('start_time', { ascending: false })
        .limit(limit)
      setWorkouts(data ?? [])
    },
    [supabase]
  )

  const startWorkout = useCallback((type: string) => {
    setIsActive(true)
    setIsPaused(false)
    setElapsedSeconds(0)
    setDistanceMeters(0)
    setRoutePoints([])
    lastPointRef.current = null

    intervalRef.current = setInterval(() => {
      setElapsedSeconds((s) => s + 1)
    }, 1000)

    if (navigator.geolocation) {
      watchRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          const point: RoutePoint = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            timestamp: new Date().toISOString(),
          }
          setRoutePoints((prev) => [...prev, point])
          if (lastPointRef.current) {
            const d = haversine(lastPointRef.current, point)
            setDistanceMeters((prev) => prev + d)
          }
          lastPointRef.current = point
        },
        undefined,
        { enableHighAccuracy: true, maximumAge: 3000 }
      )
    }
  }, [])

  const pauseWorkout = useCallback(() => {
    setIsPaused(true)
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (watchRef.current !== null) navigator.geolocation.clearWatch(watchRef.current)
  }, [])

  const resumeWorkout = useCallback((type: string) => {
    setIsPaused(false)
    intervalRef.current = setInterval(() => setElapsedSeconds((s) => s + 1), 1000)
    if (navigator.geolocation) {
      watchRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          const point: RoutePoint = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            timestamp: new Date().toISOString(),
          }
          setRoutePoints((prev) => [...prev, point])
          if (lastPointRef.current) {
            setDistanceMeters((prev) => prev + haversine(lastPointRef.current!, point))
          }
          lastPointRef.current = point
        },
        undefined,
        { enableHighAccuracy: true, maximumAge: 3000 }
      )
    }
  }, [])

  const finishWorkout = useCallback(
    async (userId: string, type: string, startTime: Date) => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (watchRef.current !== null) navigator.geolocation.clearWatch(watchRef.current)
      setIsActive(false)
      setIsPaused(false)

      const durationMin = elapsedSeconds / 60
      const calories = estimateCalories(type, durationMin)
      const end = new Date()

      const { data, error } = await supabase
        .from('workouts')
        .insert({
          user_id: userId,
          type,
          title: WORKOUT_TYPES.find((t) => t.id === type)?.name ?? type,
          start_time: startTime.toISOString(),
          end_time: end.toISOString(),
          duration_seconds: elapsedSeconds,
          distance_meters: Math.round(distanceMeters),
          calories,
          route_data: routePoints,
          source: routePoints.length > 0 ? 'gps' : 'manual',
          is_public: true,
        })
        .select()
        .single()

      if (!error && data) {
        setWorkouts((prev) => [data, ...prev])
        return data as Workout
      }
      return null
    },
    [supabase, elapsedSeconds, distanceMeters, routePoints]
  )

  return {
    workouts,
    isActive,
    isPaused,
    elapsedSeconds,
    distanceMeters,
    routePoints,
    fetchWorkoutHistory,
    startWorkout,
    pauseWorkout,
    resumeWorkout,
    finishWorkout,
    estimateCalories,
  }
}
