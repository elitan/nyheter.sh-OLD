import { twMerge } from 'tailwind-merge';

interface Props {
  children: React.ReactNode;
  className?: string;
}
export function MainContainer(props: Props) {
  const { children, className } = props;

  const classNames = twMerge(`max-w-6xl mx-auto px-2`, className);

  return <div className={classNames}>{children}</div>;
}
