
"use client";

import { useState, Suspense } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase-config";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

function SignupForm() {
  const searchParams = useSearchParams();
  const initialRole = searchParams.get("role") || "sme";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"sme" | "consultant" | "admin" | "partner">(initialRole as any);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const profileData = {
        name,
        email,
        role,
        onboarded: false,
        createdAt: serverTimestamp(),
      };

      const userDocRef = doc(db, "users", user.uid);

      setDoc(userDocRef, profileData)
        .then(() => {
          toast({ 
            title: "Account created!", 
            description: `Welcome to OpsMarketplace as a ${role.toUpperCase()}.` 
          });
          
          if (role === 'consultant') {
            router.push("/profile/setup");
          } else if (role === 'admin') {
            router.push("/dashboard/admin");
          } else if (role === 'partner') {
            router.push("/onboarding/partner");
          } else {
            router.push("/onboarding/sme");
          }
        })
        .catch(async (error) => {
          const permissionError = new FirestorePermissionError({
            path: userDocRef.path,
            operation: 'create',
            requestResourceData: profileData,
          });
          errorEmitter.emit('permission-error', permissionError);
          setLoading(false);
        });

    } catch (error: any) {
      toast({
        title: "Signup Failed",
        description: error.message,
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl font-headline">Create Account</CardTitle>
        <CardDescription>Join our marketplace today</CardDescription>
      </CardHeader>
      <form onSubmit={handleSignup}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="space-y-4 pt-2">
            <Label>I am a:</Label>
            <RadioGroup value={role} onValueChange={(v: any) => setRole(v)} className="flex flex-col gap-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="sme" id="role-sme" />
                <Label htmlFor="role-sme">SME (Requestor)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="consultant" id="role-consultant" />
                <Label htmlFor="role-consultant">Consultant (Provider)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="partner" id="role-partner" />
                <Label htmlFor="role-partner">Channel Partner</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="admin" id="role-admin" />
                <Label htmlFor="role-admin">Platform Admin</Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button className="w-full" type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Sign Up"}
          </Button>
          <p className="text-sm text-center text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-medium hover:underline">
              Login
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}

export default function SignupPage() {
  return (
    <div className="container mx-auto px-4 py-20 flex justify-center">
      <Suspense fallback={<div>Loading...</div>}>
        <SignupForm />
      </Suspense>
    </div>
  );
}
