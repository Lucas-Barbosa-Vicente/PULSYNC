import Avatar from '@/components/ui/Avatar'

interface PageHeaderProps {
  title: string
  subtitle?: string
  avatarName?: string
  avatarUri?: string | null
}

export default function PageHeader({ title, subtitle, avatarName, avatarUri }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between pt-12 pb-2 px-4">
      <div>
        <h1 className="title-display">{title}</h1>
        {subtitle && (
          <p className="label-today mt-0.5">{subtitle}</p>
        )}
      </div>
      {avatarName && (
        <Avatar
          size="md"
          name={avatarName}
          uri={avatarUri}
          className="border-2 border-primary mt-1"
        />
      )}
    </div>
  )
}
