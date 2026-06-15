/**
 * A reusable Skeleton component for handling loading states with a shimmer effect.
 */
export const Skeleton = ({ className, width, height, circle }) => {
	const style = {
		width: width || "100%",
		height: height || "1rem",
		borderRadius: circle ? "50%" : "0.75rem",
	};

	return (
		<div
			className={`animate-pulse bg-slate-100 ${className}`}
			style={style}
		></div>
	);
};

export const TransactionSkeleton = () => (
	<div className="flex items-center space-x-4 p-4 border-b border-slate-50 last:border-0">
		<Skeleton width="3rem" height="3rem" className="rounded-2xl" />
		<div className="flex-1 space-y-2">
			<Skeleton width="40%" height="0.75rem" />
			<Skeleton width="20%" height="0.5rem" />
		</div>
		<Skeleton width="4rem" height="1rem" />
	</div>
);

export const CardSkeleton = () => (
    <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 flex flex-col justify-between h-[200px]">
        <div className="space-y-2">
            <Skeleton width="30%" height="0.5rem" />
            <Skeleton width="60%" height="1.5rem" />
        </div>
        <div className="flex justify-between items-end">
            <Skeleton width="40%" height="0.75rem" />
            <Skeleton width="2rem" height="2rem" circle />
        </div>
    </div>
);
