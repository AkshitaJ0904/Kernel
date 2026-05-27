interface PillProps {
  difficulty: 'easy' | 'medium' | 'hard'
}

export default function Pill({ difficulty }: PillProps) {
  return (
    <span className="pill" data-diff={difficulty}>
      {difficulty}
    </span>
  )
}
