import type { Metadata } from "next";
import "./globals.css";
import { ReduxProvider } from "@/stores/provider";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import NextTopLoader from "nextjs-toploader";


export const metadata: Metadata = {
  title: "Books",
  icons: {
    icon: "/logo.png"
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AntdRegistry>
          <NextTopLoader 
            color="#5750F1" 
            showSpinner={false}
            height={3}
            crawlSpeed={200}
            speed={200}
            easing="ease"
            shadow="0 0 10px #5750F1,0 0 5px #5750F1"
          />
          <ReduxProvider>{children}</ReduxProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
