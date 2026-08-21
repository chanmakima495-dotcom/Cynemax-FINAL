export default function SkeletonCard({ size = 'md' }) {
  const widthClass = { sm: 'w-28 sm:w-32', md: 'w-36 sm:w-40 md:w-44', lg: 'w-40 sm:w-48 md:w-52' }[size];
  return (
    <div className={`${widthClass} shrink-0`}>
      <div className="skeleton rounded-xl aspect-[2/3]" />
      <div className="skeleton h-3 rounded mt-2 w-3/4" />
    </div>
  );
}
