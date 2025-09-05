export default function TestMiddlewarePage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Middleware Test Page</h1>
      <p>If you can see this page, the middleware is not properly protecting this route.</p>
      <p>This page should only be accessible when authenticated.</p>
    </div>
  );
}
