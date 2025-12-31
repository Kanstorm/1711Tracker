export default function Button(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { className = "", ...rest } = props;
  return (
    <button
      {...rest}
      className={
        "rounded-xl px-4 py-2 font-semibold bg-white/10 hover:bg-white/15 border border-white/10 " +
        "transition active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed " +
        className
      }
    />
  );
}
