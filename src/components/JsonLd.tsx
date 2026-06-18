/**
 * Renders a JSON-LD <script>. A Server Component, so the structured data is in
 * the initial HTML the crawler reads — never injected on the client.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // Content is built server-side from our own data, not user input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
