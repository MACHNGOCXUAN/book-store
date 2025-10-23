import { FireOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import { Button, Col, Modal, Row, Typography } from 'antd';
import { useEffect, useRef, useState } from 'react';
import type { Book } from "../types/Book";
import ProductCard from './ProductCard';

const { Title } = Typography

// Mock data for bestselling books
const ProductBestSaler = () => {
    const [booksWeek, setBooksWeek] = useState<Book[]>([]);
    const [booksMonth, setBooksMonth] = useState<Book[]>([]);
    const [booksYear, setBooksYear] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('week')
    const [scrollPosition, setScrollPosition] = useState(0)
    const [showAllBooks, setShowAllBooks] = useState(false)
    const scrollContainerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                setLoading(true);
                const res = await fetch("http://localhost:8080/api/books/bestsellers/week");
                const res2 = await fetch("http://localhost:8080/api/books/bestsellers/month");
                const res3 = await fetch("http://localhost:8080/api/books/bestsellers/year");

                if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
                if (!res2.ok) throw new Error(`HTTP error! Status: ${res.status}`);
                if (!res3.ok) throw new Error(`HTTP error! Status: ${res.status}`);

                // Parse JSON
                const data = await res.json();
                const data2 = await res2.json();
                const data3 = await res3.json();

                setBooksWeek(data);
                setBooksMonth(data2);
                setBooksYear(data3);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchBooks();
    }, []);
    const handleScroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = 300
            const newPosition = direction === 'left'
                ? scrollPosition - scrollAmount
                : scrollPosition + scrollAmount

            scrollContainerRef.current.scrollTo({
                left: newPosition,
                behavior: 'smooth'
            })
            setScrollPosition(newPosition)
        }
    }

    return (
        <>
            {/* Bestselling Books Section */}
            <div style={{ background: 'white', padding: '60px 0' }}>
                <div className="container" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <FireOutlined style={{ fontSize: 32, color: '#C92127' }} />
                            <Title level={2} style={{ margin: 0, color: '#C92127' }}>
                                Sách Bán Chạy
                            </Title>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <Button
                                type={activeTab === 'week' ? 'primary' : 'default'}
                                onClick={() => setActiveTab('week')}
                                style={{
                                    background: activeTab === 'week' ? '#C92127' : 'transparent',
                                    borderColor: '#C92127',
                                    color: activeTab === 'week' ? 'white' : '#C92127',
                                }}
                            >
                                Tuần
                            </Button>
                            <Button
                                type={activeTab === 'month' ? 'primary' : 'default'}
                                onClick={() => setActiveTab('month')}
                                style={{
                                    background: activeTab === 'month' ? '#C92127' : 'transparent',
                                    borderColor: '#C92127',
                                    color: activeTab === 'month' ? 'white' : '#C92127',
                                }}
                            >
                                Tháng
                            </Button>
                            <Button
                                type={activeTab === 'year' ? 'primary' : 'default'}
                                onClick={() => setActiveTab('year')}
                                style={{
                                    background: activeTab === 'year' ? '#C92127' : 'transparent',
                                    borderColor: '#C92127',
                                    color: activeTab === 'year' ? 'white' : '#C92127',
                                }}
                            >
                                Năm
                            </Button>
                        </div>
                    </div>

                    {/* Carousel Container */}
                    <div style={{ position: 'relative', margin: '0 50px' }}>
                        {/* Left Arrow */}
                        <Button
                            icon={<LeftOutlined />}
                            onClick={() => handleScroll('left')}
                            style={{
                                position: 'absolute',
                                left: -50,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                zIndex: 10,
                                width: 40,
                                height: 40,
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: 'white',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                border: '1px solid #e8e8e8',
                            }}
                        />

                        {/* Scrollable Container */}
                        <div
                            ref={scrollContainerRef}
                            style={{
                                display: 'flex',
                                gap: 16,
                                overflowX: 'auto',
                                scrollbarWidth: 'none',
                                msOverflowStyle: 'none',
                                padding: '8px 4px',
                            }}
                            className="hide-scrollbar"
                        >
                            {loading ? (
                                <div style={{ width: '100%', textAlign: 'center', padding: '40px 0' }}>
                                    <span style={{ color: '#666' }}>Đang tải...</span>
                                </div>
                            ) : (
                                <>
                                    {activeTab === 'week' && booksWeek.map((book) => (
                                        <div
                                            key={book.bookId}
                                            style={{
                                                minWidth: 200,
                                                flex: '0 0 auto',
                                            }}
                                        >
                                            <ProductCard book={book} />
                                        </div>
                                    ))}
                                    {activeTab === 'month' && booksMonth.map((book) => (
                                        <div
                                            key={book.bookId}
                                            style={{
                                                minWidth: 200,
                                                flex: '0 0 auto',
                                            }}
                                        >
                                            <ProductCard book={book} />
                                        </div>
                                    ))}
                                    {activeTab === 'year' && booksYear.map((book) => (
                                        <div
                                            key={book.bookId}
                                            style={{
                                                minWidth: 200,
                                                flex: '0 0 auto',
                                            }}
                                        >
                                            <ProductCard book={book} />
                                        </div>
                                    ))}
                                </>
                            )}
                        </div>

                        {/* Right Arrow */}
                        <Button
                            icon={<RightOutlined />}
                            onClick={() => handleScroll('right')}
                            style={{
                                position: 'absolute',
                                right: -50,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                zIndex: 10,
                                width: 40,
                                height: 40,
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: 'white',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                border: '1px solid #e8e8e8',
                            }}
                        />
                    </div>

                    {/* View More Button */}
                    <div style={{ textAlign: 'center', marginTop: 32 }}>
                        <Button
                            type="link"
                            onClick={() => setShowAllBooks(true)}
                            style={{
                                color: '#C92127',
                                fontSize: 16,
                                fontWeight: 500,
                            }}
                        >
                            Xem thêm →
                        </Button>
                    </div>
                </div>
            </div>

            {/* Modal for All Books */}
            <Modal
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <FireOutlined style={{ fontSize: 24, color: '#C92127' }} />
                        <span style={{ color: '#C92127', fontSize: 20 }}>
                            Tất cả sách bán chạy - {activeTab === 'week' ? 'Tuần' : activeTab === 'month' ? 'Tháng' : 'Năm'}
                        </span>
                    </div>
                }
                open={showAllBooks}
                onCancel={() => setShowAllBooks(false)}
                footer={null}
                width={1200}
                style={{ top: 20 }}
            >
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px 0' }}>
                        <span style={{ color: '#666' }}>Đang tải...</span>
                    </div>
                ) : (
                    <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
                        {activeTab === 'week' && booksWeek.map((book) => (
                            <Col key={book.bookId} xs={12} sm={8} md={6} lg={4.8}>
                                <ProductCard book={book} />
                            </Col>
                        ))}
                        {activeTab === 'month' && booksMonth.map((book) => (
                            <Col key={book.bookId} xs={12} sm={8} md={6} lg={4.8}>
                                <ProductCard book={book} />
                            </Col>
                        ))}
                        {activeTab === 'year' && booksYear.map((book) => (
                            <Col key={book.bookId} xs={12} sm={8} md={6} lg={4.8}>
                                <ProductCard book={book} />
                            </Col>
                        ))}
                    </Row>
                )}
            </Modal>
        </>
    )
}

export default ProductBestSaler
