"use client"
import React, { use } from "react";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { Metadata } from "next";
import "@/app/globals.css";
import { ReduxProvider } from "@/stores/provider";

// export const metadata: Metadata = {
//   title: "Books",
// };

const RootLayout = ({ children }: React.PropsWithChildren) => (
  <html lang="en">
    <body>
      <AntdRegistry>
        <ReduxProvider>{children}</ReduxProvider>
      </AntdRegistry>
    </body>
  </html>
);

export default RootLayout;
