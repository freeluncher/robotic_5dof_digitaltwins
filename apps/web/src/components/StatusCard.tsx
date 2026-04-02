type StatusCardProps = {
  title: string;
  value: string | number;
};

export function StatusCard({ title, value }: StatusCardProps) {
  return (
    <li className="status-card">
      <span className="status-title">{title}</span>
      <strong className="status-value">{value}</strong>
    </li>
  );
}
