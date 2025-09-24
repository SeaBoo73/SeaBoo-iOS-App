import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Anchor, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";

const quickRegistrationSchema = z.object({
  firstName: z.string().min(2, "Nome richiesto"),
  lastName: z.string().min(2, "Cognome richiesto"),
  email: z.string().email("Email non valida"),
});

type QuickRegistrationForm = z.infer<typeof quickRegistrationSchema>;

interface QuickRegistrationProps {
  title?: string;
  description?: string;
  buttonText?: string;
  className?: string;
}

export function QuickRegistration({ 
  title = "Inizia subito come noleggiatore",
  description = "Inserisci i tuoi dati per iniziare velocemente",
  buttonText = "Diventa noleggiatore",
  className = ""
}: QuickRegistrationProps) {
  const [, setLocation] = useLocation();

  const form = useForm<QuickRegistrationForm>({
    resolver: zodResolver(quickRegistrationSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
    }
  });

  const onSubmit = (data: QuickRegistrationForm) => {
    // Create URL parameters with the form data
    const params = new URLSearchParams({
      tab: 'register',
      role: 'owner',
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email
    });
    
    // Navigate to auth page with pre-filled data
    setLocation(`/auth?${params.toString()}`);
  };

  return (
    <Card className={`w-full max-w-md ${className}`}>
      <CardHeader className="text-center">
        <div className="flex items-center justify-center mb-2">
          <Anchor className="h-6 w-6 text-ocean-blue mr-2" />
          <CardTitle className="text-xl">{title}</CardTitle>
        </div>
        <p className="text-sm text-gray-600">{description}</p>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">Nome</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Mario" className="text-sm" />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">Cognome</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Rossi" className="text-sm" />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm">Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} placeholder="mario.rossi@email.com" className="text-sm" />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full bg-ocean-blue hover:bg-blue-600 text-white font-medium"
              size="sm"
            >
              {buttonText}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}