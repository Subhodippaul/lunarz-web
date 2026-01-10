"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen, Search, Calendar, User, ArrowRight, Rss } from "lucide-react";
import Link from "next/link";

export default function BlogPage() {
  const categories = [
    "Fashion Trends",
    "Style Tips",
    "Behind the Scenes",
    "Sustainability",
    "Customer Stories",
    "Design Process"
  ];

  const featuredPosts = [
    {
      id: 1,
      title: "The Future of Sustainable Fashion",
      excerpt: "Exploring how eco-friendly practices are reshaping the fashion industry and what it means for consumers.",
      author: "Lunarz Team",
      date: "2024-01-15",
      category: "Sustainability",
      image: "/blog/sustainable-fashion.jpg",
      readTime: "5 min read"
    },
    {
      id: 2,
      title: "Custom Design Trends for 2024",
      excerpt: "Discover the hottest custom design trends that are dominating the fashion scene this year.",
      author: "Design Team",
      date: "2024-01-10",
      category: "Fashion Trends",
      image: "/blog/design-trends.jpg",
      readTime: "7 min read"
    },
    {
      id: 3,
      title: "Behind the Scenes: How We Create Your Custom Tees",
      excerpt: "Take a peek into our production process and see how your custom designs come to life.",
      author: "Production Team",
      date: "2024-01-05",
      category: "Behind the Scenes",
      image: "/blog/production-process.jpg",
      readTime: "6 min read"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <BookOpen className="h-16 w-16 mx-auto mb-6" />
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Lunarz Blog</h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto">
            Stories, insights, and inspiration from the world of custom fashion
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Search and Categories */}
        <div className="mb-12">
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search articles..."
                className="pl-10 pr-4 py-3 text-lg"
              />
            </div>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            <Button variant="outline" className="rounded-full">
              All Posts
            </Button>
            {categories.map((category) => (
              <Button key={category} variant="outline" className="rounded-full">
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Coming Soon Message */}
        <div className="text-center mb-16">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-12">
              <div className="text-6xl mb-6">📝</div>
              <h2 className="text-3xl font-bold mb-4">Blog Coming Soon!</h2>
              <p className="text-lg text-gray-600 mb-6">
                We're working hard to bring you amazing content about fashion, sustainability, 
                design tips, and behind-the-scenes stories. Our blog will be launching soon!
              </p>
              <div className="space-y-4">
                <p className="text-gray-700">
                  <strong>What to expect:</strong>
                </p>
                <ul className="text-left text-gray-600 space-y-2 max-w-md mx-auto">
                  <li>• Latest fashion trends and style guides</li>
                  <li>• Sustainability in fashion industry</li>
                  <li>• Custom design inspiration and tips</li>
                  <li>• Behind-the-scenes production stories</li>
                  <li>• Customer success stories and features</li>
                  <li>• Industry insights and expert interviews</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview of Future Content */}
        {/* <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Preview: What's Coming</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredPosts.map((post) => (
              <Card key={post.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <div className="aspect-video bg-gradient-to-br from-gray-200 to-gray-300 rounded-t-lg flex items-center justify-center">
                  <div className="text-gray-500 text-center">
                    <BookOpen className="h-12 w-12 mx-auto mb-2" />
                    <p className="text-sm">Coming Soon</p>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      {post.category}
                    </span>
                    <span className="text-gray-500 text-xs">{post.readTime}</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{post.title}</h3>
                  <p className="text-gray-600 mb-4">{post.excerpt}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>{post.author}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(post.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div> */}

        {/* Newsletter Signup */}
        {/* <div className="text-center">
          <Card className="max-w-2xl mx-auto bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardContent className="p-8">
              <Rss className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-4">Stay Updated</h3>
              <p className="text-gray-600 mb-6">
                Be the first to know when our blog launches! Subscribe to get notified about 
                new articles, fashion tips, and exclusive content.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1"
                />
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Subscribe
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                No spam, unsubscribe at any time.
              </p>
            </CardContent>
          </Card>
        </div> */}

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold mb-4">While You Wait...</h3>
          <p className="text-gray-600 mb-8">
            Explore our products and start creating your custom designs today!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/products">
              <Button className="bg-purple-600 hover:bg-purple-700">
                Shop Products
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <Link href="/custom-tshirt">
              <Button variant="outline">
                Design Custom Tee
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}