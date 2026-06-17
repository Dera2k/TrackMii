import Image from "next/image"
import trackmiiIcon from "@/assets/trackmii1024.png";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center space-y-3">
          <Image
            src={trackmiiIcon}
            alt="Trackmii"
            width={150}
            height={100}
            className="object-contain"
            priority
          />
          <div className="flex flex-col items-center space-y-1">
            <span className="text-xl font-bold tracking-tight">Trackmii</span>
            <p className="text-sm text-muted-foreground">Smart expense tracking</p>
          </div>
        </div>
        {children}
      </div>
    </div>
  )
}