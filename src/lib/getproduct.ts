export async function getProducts() {
  const res = await fetch("http://localhost:5000/products");

  if (!res.ok) {
    console.error("Failed to fetch products");
    return [];
  }

  const data = await res.json();
  return data.items || [];
}
