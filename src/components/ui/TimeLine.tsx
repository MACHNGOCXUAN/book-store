export const HorizontalTimeline = ({ items }: any) => {
  return (
    <div className="w-full overflow-x-auto py-8 px-4">
      <div className="flex items-start min-w-max">
        {items.map((item: any, index: any) => (
          <div key={index} className="relative flex flex-col items-center min-w-[160px]">
            {/* Node/Circle */}
            <div className="relative z-10 flex items-center justify-center">
              <div
                className={`w-4 h-4 rounded-full border-3 bg-white transition-all duration-300`}
                style={{
                  borderColor: item.color || '#1890ff',
                  borderWidth: '3px'
                }}
              >
                {item.dot && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    {item.dot}
                  </div>
                )}
              </div>
            </div>

            {/* Connecting Line */}
            {index < items.length - 1 && (
              <div
                className="absolute top-2 left-1/2 h-0.5 bg-gray-300"
                style={{
                  width: '160px',
                  marginLeft: '8px'
                }}
              />
            )}

            {/* Content */}
            <div className="mt-5 text-center px-2 w-full">
              {item.children}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
