
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, ShieldCheck, Zap, Users } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl lg:text-6xl font-headline font-extrabold tracking-tight mb-6 text-primary">
            Scale Your Business Operations <br /> <span className="text-accent">Without the Headache</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Connect with expert consultants for compliance, payroll, and HR support. 
            Streamlined for SMEs, designed for growth.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" className="px-8" asChild>
              <Link href="/signup?role=sme">I need a Service</Link>
            </Button>
            <Button size="lg" variant="outline" className="px-8" asChild>
              <Link href="/signup?role=consultant">I'm a Consultant</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-headline font-bold mb-4">Our Service Categories</h2>
            <p className="text-muted-foreground">Expert support across all critical business operations</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: "Labour Compliance", icon: ShieldCheck, desc: "Stay compliant with state and central labour laws effortlessly." },
              { title: "PF/ESIC Registration", icon: CheckCircle, desc: "End-to-end registration and monthly filing support." },
              { title: "Payroll Setup", icon: Zap, desc: "Automated, accurate, and timely payroll processing systems." },
              { title: "HR Policy Drafting", icon: Users, desc: "Customized policy frameworks for modern workplace cultures." },
              { title: "Compliance Audit", icon: ShieldCheck, desc: "Identify and bridge gaps in your operational compliance." },
            ].map((service, i) => (
              <Card key={i} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-8">
                  <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                    <service.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{service.title}</h3>
                  <p className="text-muted-foreground">{service.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <p className="opacity-80">SMEs Supported</p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">100+</div>
              <p className="opacity-80">Expert Consultants</p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">24h</div>
              <p className="opacity-80">Average Lead Matching</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
