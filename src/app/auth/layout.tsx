import '../globals.css';

// Yekan font configuration  
const yekan = {
  className: 'font-yekan'
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={yekan.className + ' min-h-screen bg-gray-50'}>
      {children}
    </div>
  );
}
