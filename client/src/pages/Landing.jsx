import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Building2, 
  Users, 
  Star, 
  Shield, 
  ArrowRight,
  CheckCircle,
  Package,
  MessageSquare
} from "lucide-react";

export default function Landing() {
  const features = [
    {
      icon: Building2,
      title: "Vendor Registration",
      description: "Easy sign-up process for vendors to create their business profile and showcase services."
    },
    {
      icon: Package,
      title: "Product Showcase",
      description: "Display your products with images, descriptions, and pricing to attract potential clients."
    },
    {
      icon: Star,
      title: "Ratings & Reviews",
      description: "Build trust with client feedback and ratings to stand out in the marketplace."
    },
    {
      icon: Users,
      title: "Browse Vendors",
      description: "Find the perfect vendor by category, location, and ratings for your project needs."
    }
  ];

  const benefits = [
    "Free vendor registration",
    "Unlimited product listings",
    "Client feedback system",
    "Public vendor profiles",
    "Search and filter options",
    "Mobile-friendly design"
  ];

  return (
    <div className="min-h-screen">
      <section className="relative py-20 px-4 bg-gradient-to-br from-primary/5 via-background to-primary/10">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 text-center lg:text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                Connect with Top
                <span className="text-primary block mt-2">Business Vendors</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl">
                VendorHub is your one-stop platform to discover, connect, and collaborate 
                with verified contractors, suppliers, and service providers.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/register">
                  <Button size="lg" className="w-full sm:w-auto" data-testid="hero-register-btn">
                    Register as Vendor
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/vendors">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto" data-testid="hero-browse-btn">
                    Browse Vendors
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex-1 hidden lg:flex justify-center">
              <div className="relative w-full max-w-md">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/5 rounded-3xl blur-3xl"></div>
                <Card className="relative bg-card/80 backdrop-blur border-2">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <Building2 className="h-8 w-8 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">VendorHub</h3>
                        <p className="text-sm text-muted-foreground">Trusted by businesses</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      {benefits.slice(0, 4).map((benefit, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                          <span className="text-sm">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-muted/30">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Comprehensive tools for vendors and clients to connect and grow together.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="hover-elevate active-elevate-2 transition-all duration-200">
                <CardContent className="p-6">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Why Choose VendorHub?
              </h2>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="h-4 w-4 text-primary" />
                    </div>
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <Link href="/register">
                  <Button data-testid="cta-register-btn">
                    Get Started Today
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex-1">
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-6 text-center">
                  <div className="text-4xl font-bold text-primary mb-2">100+</div>
                  <p className="text-sm text-muted-foreground">Registered Vendors</p>
                </Card>
                <Card className="p-6 text-center">
                  <div className="text-4xl font-bold text-primary mb-2">500+</div>
                  <p className="text-sm text-muted-foreground">Products Listed</p>
                </Card>
                <Card className="p-6 text-center">
                  <div className="text-4xl font-bold text-primary mb-2">1000+</div>
                  <p className="text-sm text-muted-foreground">Client Reviews</p>
                </Card>
                <Card className="p-6 text-center">
                  <div className="text-4xl font-bold text-primary mb-2">4.8</div>
                  <p className="text-sm text-muted-foreground">Average Rating</p>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Grow Your Business?
          </h2>
          <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
            Join VendorHub today and connect with clients looking for quality vendors like you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" variant="secondary" data-testid="footer-register-btn">
                Register Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/vendors">
              <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground" data-testid="footer-browse-btn">
                Explore Vendors
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="py-8 px-4 border-t">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" />
            <span className="font-semibold">VendorHub</span>
          </div>
          <p className="text-sm text-muted-foreground">
            2024 VendorHub. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
