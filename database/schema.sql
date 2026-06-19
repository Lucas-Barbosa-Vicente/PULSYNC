-- ══════════════════════════════════════════════════════════════
-- PULSYNC — Schema SQL completo
-- ══════════════════════════════════════════════════════════════

-- SEÇÃO 1: TABELAS
-- ══════════════════════════════════════════════════════════════

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name  TEXT NOT NULL,
  avatar_url    TEXT,
  bio           TEXT,
  timezone      TEXT NOT NULL DEFAULT 'America/Sao_Paulo',
  units         TEXT NOT NULL DEFAULT 'metric' CHECK (units IN ('metric', 'imperial')),
  privacy_settings JSONB NOT NULL DEFAULT '{"feed":"friends","stats":"friends","challenges":"friends"}',
  streak_freezes_remaining INTEGER NOT NULL DEFAULT 3,
  total_xp      INTEGER NOT NULL DEFAULT 0,
  level         INTEGER NOT NULL DEFAULT 1,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS friendships (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requester_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  addressee_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status        TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'BLOCKED')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (requester_id, addressee_id)
);

CREATE TABLE IF NOT EXISTS habits (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  description   TEXT,
  icon          TEXT NOT NULL DEFAULT '⭐',
  color         TEXT NOT NULL DEFAULT '#00D4AA',
  type          TEXT NOT NULL DEFAULT 'HABIT' CHECK (type IN ('HABIT', 'DAILY', 'TODO')),
  frequency     JSONB NOT NULL DEFAULT '{"type":"daily"}',
  target_value  NUMERIC,
  target_unit   TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  order_index   INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  archived_at   TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS habit_logs (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  habit_id      UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  completed_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  value         NUMERIC,
  notes         TEXT,
  source        TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'freeze'))
);

CREATE TABLE IF NOT EXISTS streaks (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  habit_id            UUID REFERENCES habits(id) ON DELETE CASCADE,
  current_count       INTEGER NOT NULL DEFAULT 0,
  longest_count       INTEGER NOT NULL DEFAULT 0,
  last_completed_date DATE,
  freeze_used_at      DATE,
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS workouts (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type             TEXT NOT NULL,
  title            TEXT NOT NULL,
  start_time       TIMESTAMPTZ NOT NULL,
  end_time         TIMESTAMPTZ NOT NULL,
  duration_seconds INTEGER NOT NULL,
  distance_meters  NUMERIC,
  calories         NUMERIC,
  avg_heart_rate   INTEGER,
  route_data       JSONB,
  source           TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'gps')),
  is_public        BOOLEAN NOT NULL DEFAULT TRUE,
  is_pr            BOOLEAN DEFAULT FALSE,
  metadata         JSONB
);

CREATE TABLE IF NOT EXISTS meals (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  meal_type        TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  logged_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  total_calories   NUMERIC NOT NULL DEFAULT 0,
  protein_g        NUMERIC NOT NULL DEFAULT 0,
  carbs_g          NUMERIC NOT NULL DEFAULT 0,
  fat_g            NUMERIC NOT NULL DEFAULT 0,
  notes            TEXT
);

CREATE TABLE IF NOT EXISTS meal_items (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meal_id      UUID NOT NULL REFERENCES meals(id) ON DELETE CASCADE,
  food_name    TEXT NOT NULL,
  quantity     NUMERIC NOT NULL,
  unit         TEXT NOT NULL,
  calories     NUMERIC NOT NULL,
  protein_g    NUMERIC NOT NULL DEFAULT 0,
  carbs_g      NUMERIC NOT NULL DEFAULT 0,
  fat_g        NUMERIC NOT NULL DEFAULT 0,
  barcode      TEXT,
  food_source  TEXT NOT NULL DEFAULT 'manual' CHECK (food_source IN ('openfoodfacts', 'usda', 'manual'))
);

CREATE TABLE IF NOT EXISTS sleep_sessions (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  start_time          TIMESTAMPTZ NOT NULL,
  end_time            TIMESTAMPTZ NOT NULL,
  duration_minutes    INTEGER NOT NULL,
  quality_score       INTEGER NOT NULL CHECK (quality_score BETWEEN 0 AND 100),
  deep_sleep_minutes  INTEGER NOT NULL DEFAULT 0,
  light_sleep_minutes INTEGER NOT NULL DEFAULT 0,
  rem_minutes         INTEGER NOT NULL DEFAULT 0,
  awake_minutes       INTEGER NOT NULL DEFAULT 0,
  source              TEXT NOT NULL DEFAULT 'manual'
);

CREATE TABLE IF NOT EXISTS weight_logs (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  weight_kg  NUMERIC NOT NULL,
  logged_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes      TEXT
);

CREATE TABLE IF NOT EXISTS water_logs (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount_ml  INTEGER NOT NULL,
  logged_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS challenges (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  description  TEXT NOT NULL DEFAULT '',
  type         TEXT NOT NULL CHECK (type IN ('steps', 'workouts', 'habits', 'calories', 'sleep', 'custom')),
  metric       TEXT NOT NULL,
  target_value NUMERIC NOT NULL,
  unit         TEXT NOT NULL,
  start_date   DATE NOT NULL,
  end_date     DATE NOT NULL,
  status       TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'cancelled')),
  is_public    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS challenge_participants (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  challenge_id  UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  current_value NUMERIC NOT NULL DEFAULT 0,
  rank          INTEGER NOT NULL DEFAULT 1,
  joined_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at  TIMESTAMPTZ,
  UNIQUE (challenge_id, user_id)
);

CREATE TABLE IF NOT EXISTS achievements (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug        TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  description TEXT NOT NULL,
  icon        TEXT NOT NULL,
  category    TEXT NOT NULL CHECK (category IN ('streaks', 'workouts', 'nutrition', 'sleep', 'social', 'challenges')),
  tier        TEXT NOT NULL CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
  condition   JSONB NOT NULL DEFAULT '{}',
  xp_reward   INTEGER NOT NULL DEFAULT 50,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_achievements (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, achievement_id)
);

CREATE TABLE IF NOT EXISTS activity_feed (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type           TEXT NOT NULL CHECK (type IN ('workout', 'habit_streak', 'achievement', 'challenge_joined', 'challenge_won')),
  reference_id   UUID,
  reference_type TEXT,
  visibility     TEXT NOT NULL DEFAULT 'friends' CHECK (visibility IN ('public', 'friends', 'private')),
  kudos_count    INTEGER NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS kudos (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  feed_item_id UUID NOT NULL REFERENCES activity_feed(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (feed_item_id, user_id)
);

CREATE TABLE IF NOT EXISTS comments (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  feed_item_id UUID NOT NULL REFERENCES activity_feed(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content      TEXT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type       TEXT NOT NULL,
  title      TEXT NOT NULL,
  body       TEXT NOT NULL,
  data       JSONB,
  is_read    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- SEÇÃO 2: ÍNDICES
-- ══════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_habit_logs_user_date ON habit_logs (user_id, completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_habit_logs_habit_date ON habit_logs (habit_id, completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_workouts_user_time ON workouts (user_id, start_time DESC);
CREATE INDEX IF NOT EXISTS idx_activity_feed_user_time ON activity_feed (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_challenge_participants_rank ON challenge_participants (challenge_id, current_value DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_streaks_user_habit ON streaks (user_id, habit_id);


-- SEÇÃO 3: ROW LEVEL SECURITY
-- ══════════════════════════════════════════════════════════════

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE sleep_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE weight_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE water_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE kudos ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Profiles
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS "profiles_select_friends" ON profiles;
CREATE POLICY "profiles_select_friends" ON profiles FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM friendships
    WHERE status = 'ACCEPTED'
    AND (
      (requester_id = auth.uid() AND addressee_id = id)
      OR (addressee_id = auth.uid() AND requester_id = id)
    )
  )
);
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = id);
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Friendships
DROP POLICY IF EXISTS "friendships_select" ON friendships;
CREATE POLICY "friendships_select" ON friendships FOR SELECT USING (
  auth.uid() = requester_id OR auth.uid() = addressee_id
);
DROP POLICY IF EXISTS "friendships_insert" ON friendships;
CREATE POLICY "friendships_insert" ON friendships FOR INSERT WITH CHECK (auth.uid() = requester_id);
DROP POLICY IF EXISTS "friendships_update" ON friendships;
CREATE POLICY "friendships_update" ON friendships FOR UPDATE USING (
  auth.uid() = requester_id OR auth.uid() = addressee_id
);

-- Health data (habits, workouts, meals, sleep, weight, water)
DROP POLICY IF EXISTS "habits_own" ON habits;
CREATE POLICY "habits_own" ON habits USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "habit_logs_own" ON habit_logs;
CREATE POLICY "habit_logs_own" ON habit_logs USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "streaks_own" ON streaks;
CREATE POLICY "streaks_own" ON streaks USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "workouts_own" ON workouts;
CREATE POLICY "workouts_own" ON workouts USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "meals_own" ON meals;
CREATE POLICY "meals_own" ON meals USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "meal_items_own" ON meal_items;
CREATE POLICY "meal_items_own" ON meal_items USING (
  EXISTS (SELECT 1 FROM meals WHERE meals.id = meal_items.meal_id AND meals.user_id = auth.uid())
);
DROP POLICY IF EXISTS "sleep_own" ON sleep_sessions;
CREATE POLICY "sleep_own" ON sleep_sessions USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "weight_own" ON weight_logs;
CREATE POLICY "weight_own" ON weight_logs USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "water_own" ON water_logs;
CREATE POLICY "water_own" ON water_logs USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Activity feed
DROP POLICY IF EXISTS "feed_select" ON activity_feed;
CREATE POLICY "feed_select" ON activity_feed FOR SELECT USING (
  auth.uid() = user_id
  OR visibility = 'public'
  OR (
    visibility = 'friends' AND EXISTS (
      SELECT 1 FROM friendships
      WHERE status = 'ACCEPTED'
      AND (
        (requester_id = auth.uid() AND addressee_id = user_id)
        OR (addressee_id = auth.uid() AND requester_id = user_id)
      )
    )
  )
);
DROP POLICY IF EXISTS "feed_insert_own" ON activity_feed;
CREATE POLICY "feed_insert_own" ON activity_feed FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "feed_delete_own" ON activity_feed;
CREATE POLICY "feed_delete_own" ON activity_feed FOR DELETE USING (auth.uid() = user_id);

-- Challenges
DROP POLICY IF EXISTS "challenges_select" ON challenges;
CREATE POLICY "challenges_select" ON challenges FOR SELECT USING (
  is_public = TRUE
  OR auth.uid() = creator_id
  OR EXISTS (SELECT 1 FROM challenge_participants WHERE challenge_id = challenges.id AND user_id = auth.uid())
);
DROP POLICY IF EXISTS "challenges_insert" ON challenges;
CREATE POLICY "challenges_insert" ON challenges FOR INSERT WITH CHECK (auth.uid() = creator_id);
DROP POLICY IF EXISTS "challenges_update_own" ON challenges;
CREATE POLICY "challenges_update_own" ON challenges FOR UPDATE USING (auth.uid() = creator_id);

-- Challenge participants
DROP POLICY IF EXISTS "cp_select" ON challenge_participants;
CREATE POLICY "cp_select" ON challenge_participants FOR SELECT USING (
  EXISTS (SELECT 1 FROM challenge_participants cp2 WHERE cp2.challenge_id = challenge_participants.challenge_id AND cp2.user_id = auth.uid())
  OR auth.uid() = user_id
);
DROP POLICY IF EXISTS "cp_insert" ON challenge_participants;
CREATE POLICY "cp_insert" ON challenge_participants FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "cp_update_own" ON challenge_participants;
CREATE POLICY "cp_update_own" ON challenge_participants FOR UPDATE USING (auth.uid() = user_id);

-- Achievements (public read)
DROP POLICY IF EXISTS "achievements_select_all" ON achievements;
CREATE POLICY "achievements_select_all" ON achievements FOR SELECT USING (TRUE);

-- User achievements
DROP POLICY IF EXISTS "ua_select_own" ON user_achievements;
CREATE POLICY "ua_select_own" ON user_achievements FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "ua_insert_own" ON user_achievements;
CREATE POLICY "ua_insert_own" ON user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Kudos & comments (read free, write authenticated)
DROP POLICY IF EXISTS "kudos_select" ON kudos;
CREATE POLICY "kudos_select" ON kudos FOR SELECT USING (TRUE);
DROP POLICY IF EXISTS "kudos_insert" ON kudos;
CREATE POLICY "kudos_insert" ON kudos FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "kudos_delete_own" ON kudos;
CREATE POLICY "kudos_delete_own" ON kudos FOR DELETE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "comments_select" ON comments;
CREATE POLICY "comments_select" ON comments FOR SELECT USING (TRUE);
DROP POLICY IF EXISTS "comments_insert" ON comments;
CREATE POLICY "comments_insert" ON comments FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Notifications
DROP POLICY IF EXISTS "notifications_own" ON notifications;
CREATE POLICY "notifications_own" ON notifications USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);


-- SEÇÃO 4: FUNÇÕES E TRIGGERS
-- ══════════════════════════════════════════════════════════════

-- Função: award XP ao usuário
CREATE OR REPLACE FUNCTION award_xp(p_user_id UUID, p_amount INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles
  SET total_xp = total_xp + p_amount,
      level = GREATEST(1, FLOOR(SQRT(CAST((total_xp + p_amount) AS FLOAT) / 100))::INTEGER + 1),
      updated_at = NOW()
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função: obter IDs de amigos
CREATE OR REPLACE FUNCTION get_friends_ids(p_user_id UUID)
RETURNS TABLE(friend_id UUID) AS $$
BEGIN
  RETURN QUERY
  SELECT CASE
    WHEN requester_id = p_user_id THEN addressee_id
    ELSE requester_id
  END AS friend_id
  FROM friendships
  WHERE status = 'ACCEPTED'
  AND (requester_id = p_user_id OR addressee_id = p_user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função: atualizar rankings do desafio
CREATE OR REPLACE FUNCTION update_challenge_ranks(p_challenge_id UUID)
RETURNS VOID AS $$
BEGIN
  WITH ranked AS (
    SELECT id, ROW_NUMBER() OVER (ORDER BY current_value DESC) AS new_rank
    FROM challenge_participants
    WHERE challenge_id = p_challenge_id
  )
  UPDATE challenge_participants cp
  SET rank = ranked.new_rank
  FROM ranked
  WHERE cp.id = ranked.id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: atualizar streak após log de hábito
CREATE OR REPLACE FUNCTION fn_after_habit_log_insert()
RETURNS TRIGGER AS $$
DECLARE
  v_yesterday DATE := CURRENT_DATE - INTERVAL '1 day';
  v_today     DATE := CURRENT_DATE;
  v_streak    streaks%ROWTYPE;
BEGIN
  SELECT * INTO v_streak
  FROM streaks
  WHERE habit_id = NEW.habit_id AND user_id = NEW.user_id
  LIMIT 1;

  IF v_streak.id IS NULL THEN
    INSERT INTO streaks (user_id, habit_id, current_count, longest_count, last_completed_date)
    VALUES (NEW.user_id, NEW.habit_id, 1, 1, v_today);
  ELSIF v_streak.last_completed_date = v_yesterday OR v_streak.last_completed_date IS NULL THEN
    UPDATE streaks
    SET current_count = current_count + 1,
        longest_count = GREATEST(longest_count, current_count + 1),
        last_completed_date = v_today,
        updated_at = NOW()
    WHERE id = v_streak.id;
  ELSIF v_streak.last_completed_date < v_yesterday THEN
    UPDATE streaks
    SET current_count = 1,
        last_completed_date = v_today,
        updated_at = NOW()
    WHERE id = v_streak.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS after_habit_log_insert ON habit_logs;
CREATE TRIGGER after_habit_log_insert
AFTER INSERT ON habit_logs
FOR EACH ROW EXECUTE FUNCTION fn_after_habit_log_insert();

-- Trigger: fan-out para activity_feed após treino
CREATE OR REPLACE FUNCTION fn_after_workout_insert()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO activity_feed (user_id, type, reference_id, reference_type, visibility)
  VALUES (NEW.user_id, 'workout', NEW.id, 'workout',
    CASE WHEN NEW.is_public THEN 'friends' ELSE 'private' END);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS after_workout_insert ON workouts;
CREATE TRIGGER after_workout_insert
AFTER INSERT ON workouts
FOR EACH ROW EXECUTE FUNCTION fn_after_workout_insert();

-- Trigger: conceder XP após conquista
CREATE OR REPLACE FUNCTION fn_after_user_achievement_insert()
RETURNS TRIGGER AS $$
DECLARE
  v_xp INTEGER;
BEGIN
  SELECT xp_reward INTO v_xp FROM achievements WHERE id = NEW.achievement_id;
  PERFORM award_xp(NEW.user_id, v_xp);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS after_user_achievement_insert ON user_achievements;
CREATE TRIGGER after_user_achievement_insert
AFTER INSERT ON user_achievements
FOR EACH ROW EXECUTE FUNCTION fn_after_user_achievement_insert();


-- SEÇÃO 5: SEED — CONQUISTAS
-- ══════════════════════════════════════════════════════════════

INSERT INTO achievements (slug, name, description, icon, category, tier, condition, xp_reward) VALUES
-- Streaks
('streak_3',    'Faísca',      'Complete um hábito por 3 dias seguidos',    '⚡', 'streaks', 'bronze',   '{"streak_days": 3}',   50),
('streak_30',   'Em Chamas',   'Complete um hábito por 30 dias seguidos',   '🔥', 'streaks', 'silver',   '{"streak_days": 30}',  150),
('streak_100',  'Inabalável',  'Complete um hábito por 100 dias seguidos',  '💎', 'streaks', 'gold',     '{"streak_days": 100}', 300),
('streak_365',  'Lendário',    'Complete um hábito por 365 dias seguidos',  '👑', 'streaks', 'platinum', '{"streak_days": 365}', 500),
-- Treinos
('workout_1',   'Primeira Suada',  'Registre seu primeiro treino',        '💪', 'workouts', 'bronze',   '{"workouts_total": 1}',   50),
('workout_10',  'Consistente',     'Registre 10 treinos',                 '🏃', 'workouts', 'silver',   '{"workouts_total": 10}',  150),
('workout_50',  'Maratonista',     'Registre 50 treinos',                 '🏅', 'workouts', 'gold',     '{"workouts_total": 50}',  300),
('workout_200', 'Atleta',          'Registre 200 treinos',                '🏆', 'workouts', 'platinum', '{"workouts_total": 200}', 500),
-- Social
('social_partner',   'Parceria',    'Conecte-se com sua parceira',              '❤️', 'social', 'bronze', '{"has_partner": true}',         50),
('social_rivalry',   'Rivalidade',  'Participe de um desafio com sua parceira', '⚔️', 'social', 'silver', '{"challenges_with_partner": 1}', 150),
('social_inspire',   'Inspiração',  'Receba 50 kudos de sua parceira',          '✨', 'social', 'gold',   '{"kudos_received": 50}',        300),
-- Sono
('sleep_perfect',    'Noite Perfeita',   'Registre uma noite com score ≥ 90',     '🌙', 'sleep', 'bronze', '{"sleep_score_min": 90}',    50),
('sleep_elite',      'Dormidor Elite',   'Registre 7 noites consecutivas ≥ 7h',  '😴', 'sleep', 'silver', '{"sleep_streak_days": 7}',   150),
-- Nutrição
('nutrition_log',    'Nutri-Consciente', 'Registre todas as refeições por 1 dia', '🥗', 'nutrition', 'bronze', '{"full_day_logged": 1}', 50),
('nutrition_week',   'Equilíbrio',       'Registre refeições por 7 dias seguidos','⚖️', 'nutrition', 'silver', '{"full_days_logged": 7}', 150)
ON CONFLICT (slug) DO NOTHING;


-- SEÇÃO 6: SEED — HÁBITOS PADRÃO
-- ══════════════════════════════════════════════════════════════

-- Nota: estes hábitos são templates. Em produção, crie para o usuário
-- após o registro via Edge Function ou trigger em auth.users.

-- Exemplo de inserção (substituir 'USER_ID_HERE' pelo UUID real):
/*
INSERT INTO habits (user_id, name, icon, color, type, frequency, target_value, target_unit, order_index)
VALUES
  ('USER_ID_HERE', 'Beber 2L de água',   '💧', '#3B82F6', 'DAILY', '{"type":"daily"}', 2000, 'ml',  0),
  ('USER_ID_HERE', 'Meditação',          '🧘', '#A855F7', 'HABIT', '{"type":"daily"}', 10,   'min', 1),
  ('USER_ID_HERE', 'Treinar',            '🏋️', '#00D4AA', 'HABIT', '{"type":"weekly","times_per_week":3}', NULL, NULL, 2),
  ('USER_ID_HERE', 'Leitura',            '📚', '#F59E0B', 'HABIT', '{"type":"daily"}', 20,   'min', 3),
  ('USER_ID_HERE', 'Dormir às 23h',      '😴', '#6366F1', 'DAILY', '{"type":"daily"}', NULL, NULL,  4),
  ('USER_ID_HERE', 'Sem açúcar',         '🚫', '#EF4444', 'HABIT', '{"type":"daily"}', NULL, NULL,  5);
*/
