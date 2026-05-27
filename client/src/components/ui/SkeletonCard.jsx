const SkeletonCard = () => {
  return (
    <div className="bg-card-bg border border-border rounded-md overflow-hidden animate-pulse">
      {/* Image placeholder */}
      <div className="h-48 skeleton bg-bg-tertiary" />
      
      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <div className="h-6 skeleton bg-bg-tertiary rounded w-3/4" />
        
        {/* Category badge */}
        <div className="h-5 skeleton bg-bg-tertiary rounded w-1/3" />
        
        {/* Rating */}
        <div className="flex items-center gap-2">
          <div className="h-4 skeleton bg-bg-tertiary rounded w-20" />
          <div className="h-4 skeleton bg-bg-tertiary rounded w-16" />
        </div>
      </div>
    </div>
  );
};

export default SkeletonCard;