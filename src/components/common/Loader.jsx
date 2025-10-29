const Loader = ({ message = 'Cargando...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12">
      <div className="relative w-16 h-16">
        <div className="w-16 h-16 border-4 border-primary/20 rounded-full"></div>
        <div className="w-16 h-16 border-4 border-primary rounded-full animate-spin border-t-transparent absolute top-0 left-0"></div>
      </div>
      <p className="mt-4 text-gray-600 font-medium">{message}</p>
    </div>
  );
};

export default Loader;