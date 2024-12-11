import { useEffect, useState } from "react";

interface LiveExampleProps<T> {
  promise: Promise<T>;
}

export function LiveExample<T>({ promise }: LiveExampleProps<T>) {
  const [data, setData] = useState<T | T[] | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const result = await promise;
        const data = Array.isArray(result) ? [result[0]] : result;
        setData(data);
      } catch (err) {
        setError("An error occurred while fetching the example");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [promise]);

  if (loading) return <div>Loading example...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data) return null;

  const replaceBigInt = (_: string, value: any) => {
    if (typeof value === "bigint") {
      return value.toString();
    }
    if (value && typeof value === "object" && "amount" in value) {
      return {
        ...value,
        amount: value.amount.toString(),
      };
    }
    return value;
  };

  return (
    <div className="vocs_CodeBlock">
      <pre style={{ paddingLeft: "1.5rem", paddingRight: "1.5rem" }}>
        <code className="language-typescript">
          {`${JSON.stringify(data, replaceBigInt, 2)};`}
        </code>
      </pre>
    </div>
  );
}
