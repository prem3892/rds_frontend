import Image from "next/image";
import type React from "react";
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen lg:h-screen bg-gray-50">
      <div className="flex min-h-screen lg:h-screen">
        <div className="hidden lg:flex lg:w-1/2 bg-white overflow-hidden relative">
          <div className="flex flex-col justify-between w-full h-full relative">
            <Image
              src="/_static/auth/auth-left.png"
              alt="auth bg"
              width={1000}
              height={1000}
              priority
              className="w-full h-full object-contain absolute inset-0 p-4"
            />
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
