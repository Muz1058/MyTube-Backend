

export const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4',
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`${sizes[size]} animate-spin rounded-full border-t-accent border-r-transparent border-b-transparent border-l-transparent`}
        role="status"
        aria-label="loading"
      />
    </div>
  );
};

export default Spinner;
