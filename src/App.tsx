import { useEffect, useState } from "react";

interface Book {
  bookId: string;
  title: string;
  author: string;
  price: number;
  stock: number;
  coverImage?: string;
}

function App() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("http://localhost:8080/api/books")
      .then((res) => {
        if (!res.ok) throw new Error("Fetch failed " + res.status);
        return res.json();
      })
      .then((data) => {
        // nếu API trả Page<Book> thì data.content, còn nếu List<Book> thì data
        const list = Array.isArray(data) ? data : data.content;
        setBooks(list);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Đang tải...</p>;
  if (error) return <p>Lỗi: {error}</p>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Danh sách sách</h1>
      <ul>
        {books.map((b) => (
          <li key={b.bookId}>
            <strong>{b.title}</strong> – {b.author} – {b.price} ₫
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
