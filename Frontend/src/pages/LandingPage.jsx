import { Link } from 'react-router-dom';
import { ShoppingCart, Star, Users, Truck, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';

const LandingPage = () => {
    const features = [
        {
            icon: <ShoppingCart className="h-8 w-8" />,
            title: "Wide Selection",
            description: "Browse thousands of products across multiple categories"
        },
        {
            icon: <Star className="h-8 w-8" />,
            title: "Quality Products",
            description: "Top-rated items from trusted brands"
        },
        {
            icon: <Users className="h-8 w-8" />,
            title: "Customer Support",
            description: "24/7 customer service and AI-powered chatbot assistance"
        },
        {
            icon: <Truck className="h-8 w-8" />,
            title: "Fast Delivery",
            description: "Quick and reliable shipping to your doorstep"
        }
    ];

    const [scrollPosition, setScrollPosition] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            setScrollPosition(window.scrollY);
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const headerOpacity = Math.min(1, scrollPosition / 200);
    const headerShadow = scrollPosition > 10 ? 'shadow-md' : '';

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
            {/* Header with scroll effects */}
            <header
                className={`fixed w-full flex justify-between items-center p-4 md:p-6 z-50 transition-all duration-300 ${headerShadow}`}
                style={{
                    backgroundColor: `rgba(255, 255, 255, ${headerOpacity})`,
                    backdropFilter: 'blur(10px)'
                }}
            >
                <div className="flex items-center space-x-2">
                    <div className="bg-blue-600 p-2 rounded-full">
                        <span className="text-white font-bold text-lg">W</span>
                    </div>
                    <span className="text-blue-600 font-bold text-xl">Walmart</span>
                </div>
                <div className="space-x-4">
                    <Link
                        to="/login"
                        className="text-blue-600 hover:text-blue-800 transition-colors font-medium hidden md:inline-block"
                    >
                        Login
                    </Link>
                    <Link
                        to="/signup"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm md:text-base md:px-6 md:py-2"
                    >
                        Sign Up
                    </Link>
                </div>
            </header>

            {/* Hero Section */}
            <main className="pt-24 pb-16 px-6 flex items-center justify-center">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-10">
                    <div className="md:w-1/2 text-center md:text-left">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                            Save Money. <br />
                            <span className="text-blue-600">Live Better.</span>
                        </h1>
                        <p className="text-lg text-gray-700 mb-8 max-w-2xl">
                            Discover amazing deals, shop with AI-powered assistance, and enjoy a seamless shopping experience with our smart reorder system.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                            <Link
                                to="/signup"
                                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold text-lg transition-colors flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                            >
                                Get Started
                                <ChevronRight className="h-5 w-5" />
                            </Link>
                            <Link
                                to="/login"
                                className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-lg font-bold text-lg transition-colors"
                            >
                                Login
                            </Link>
                        </div>
                    </div>
                    <div className="md:w-1/2 mt-10 md:mt-0">
                        <div className="relative">
                            <div className="bg-blue-600 w-64 h-64 rounded-full absolute -top-6 -left-6 opacity-20 blur-3xl"></div>
                            <div className="bg-yellow-400 w-64 h-64 rounded-full absolute -bottom-6 -right-6 opacity-20 blur-3xl"></div>

                            <div className="relative grid grid-cols-2 gap-6">
                                <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 transform transition-transform hover:-translate-y-2">
                                    <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mb-4" />
                                    <h3 className="font-semibold text-gray-900">Electronics</h3>
                                    <p className="text-sm text-gray-600 mt-1">Up to 40% off</p>
                                </div>
                                <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 transform transition-transform hover:-translate-y-2 mt-10">
                                    <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mb-4" />
                                    <h3 className="font-semibold text-gray-900">Groceries</h3>
                                    <p className="text-sm text-gray-600 mt-1">Daily essentials</p>
                                </div>
                                <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 transform transition-transform hover:-translate-y-2">
                                    <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mb-4" />
                                    <h3 className="font-semibold text-gray-900">Home & Kitchen</h3>
                                    <p className="text-sm text-gray-600 mt-1">New arrivals</p>
                                </div>
                                <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 transform transition-transform hover:-translate-y-2 mt-10">
                                    <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mb-4" />
                                    <h3 className="font-semibold text-gray-900">Fashion</h3>
                                    <p className="text-sm text-gray-600 mt-1">Summer collection</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Features Section */}
            <section className="py-16 px-6 bg-gradient-to-b from-white to-blue-50">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Why Shop With Us?
                        </h2>
                        <p className="text-lg text-gray-600">
                            We're committed to providing you with the best shopping experience
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all transform hover:-translate-y-1"
                            >
                                <div className="text-blue-600 flex justify-center mb-4">
                                    <div className="bg-blue-50 p-4 rounded-full">
                                        {feature.icon}
                                    </div>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-600 text-center">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-16 px-6 bg-white">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            What Our Customers Say
                        </h2>
                        <p className="text-lg text-gray-600">
                            Join millions of happy shoppers worldwide
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-blue-50 p-8 rounded-2xl">
                            <div className="flex items-center mb-4">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                                ))}
                            </div>
                            <p className="text-gray-700 mb-6">
                                "The AI shopping assistant helped me find exactly what I needed in minutes. Saved me both time and money!"
                            </p>
                            <div className="flex items-center">
                                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-12 h-12 mr-3" />
                                <div>
                                    <h4 className="font-semibold text-gray-900">Sarah Johnson</h4>
                                    <p className="text-gray-600 text-sm">Regular customer for 3 years</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-blue-50 p-8 rounded-2xl">
                            <div className="flex items-center mb-4">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                                ))}
                            </div>
                            <p className="text-gray-700 mb-6">
                                "The smart reorder feature is a game-changer. Never run out of essentials again. Delivery is always on time!"
                            </p>
                            <div className="flex items-center">
                                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-12 h-12 mr-3" />
                                <div>
                                    <h4 className="font-semibold text-gray-900">Michael Chen</h4>
                                    <p className="text-gray-600 text-sm">Premium member</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-blue-50 p-8 rounded-2xl">
                            <div className="flex items-center mb-4">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                                ))}
                            </div>
                            <p className="text-gray-700 mb-6">
                                "The mobile app makes shopping so convenient. I can compare prices and place orders while on the go."
                            </p>
                            <div className="flex items-center">
                                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-12 h-12 mr-3" />
                                <div>
                                    <h4 className="font-semibold text-gray-900">Emily Rodriguez</h4>
                                    <p className="text-gray-600 text-sm">New customer</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">
                        Ready to Start Shopping?
                    </h2>
                    <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
                        Join millions of satisfied customers and experience the future of online shopping.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to="/signup"
                            className="bg-white hover:bg-blue-50 text-blue-600 px-8 py-3 rounded-lg font-bold text-lg transition-colors shadow-lg hover:shadow-xl"
                        >
                            Create Your Account
                        </Link>
                        <Link
                            to="/login"
                            className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 rounded-lg font-bold text-lg transition-colors"
                        >
                            Login to Account
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div>
                            <div className="flex items-center space-x-2 mb-6">
                                <div className="bg-blue-600 p-2 rounded-full">
                                    <span className="text-white font-bold text-lg">W</span>
                                </div>
                                <span className="text-white font-bold text-xl">Walmart</span>
                            </div>
                            <p className="text-gray-400 mb-4">
                                Your trusted partner for all shopping needs.
                            </p>
                            <div className="flex space-x-4">
                                {['Facebook', 'Twitter', 'Instagram', 'LinkedIn'].map((social, i) => (
                                    <a
                                        key={i}
                                        href="#"
                                        className="text-gray-400 hover:text-white transition-colors"
                                    >
                                        {social}
                                    </a>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold mb-4">Shop</h3>
                            <ul className="space-y-2">
                                {['Electronics', 'Groceries', 'Home & Kitchen', 'Clothing', 'Pharmacy'].map((item, i) => (
                                    <li key={i}>
                                        <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                            {item}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold mb-4">Help</h3>
                            <ul className="space-y-2">
                                {['Customer Service', 'Track Order', 'Returns & Exchanges', 'Shipping Info', 'FAQ'].map((item, i) => (
                                    <li key={i}>
                                        <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                            {item}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold mb-4">Contact</h3>
                            <ul className="space-y-2 text-gray-400">
                                <li>1-800-WALMART</li>
                                <li>support@walmart.com</li>
                                <li>24/7 Customer Support</li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-gray-800 mt-10 pt-6 text-center text-gray-500">
                        <p>
                            © 2025 Walmart Sparkathon Project. Built with ❤️ for better shopping experience.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;