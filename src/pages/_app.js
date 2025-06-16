import "@/styles/globals.css";
import { Analytics } from "@vercel/analytics/react"; // ✅ Note: correct path is `react`, not `next`

export default function App({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <Analytics />
    </>
  );
}
