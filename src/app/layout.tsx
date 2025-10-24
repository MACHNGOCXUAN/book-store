import type { Metadata } from "next";
import "./globals.css";
import { ReduxProvider } from "@/stores/provider";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { Image } from "@/assets/images";


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
          <ReduxProvider>{children}</ReduxProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
