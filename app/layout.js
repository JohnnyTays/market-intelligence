export const metadata = {
  title: 'Market Intelligence Platform',
  description: 'Strategic Intelligence Workspace',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}