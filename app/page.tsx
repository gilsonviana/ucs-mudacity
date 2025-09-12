"use client";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Home() {
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  return (
    <div
      className="relative min-h-screen w-full bg-contain bg-bottom md:bg-cover md:bg-center bg-no-repeat"
      style={{
        backgroundImage: "url(/city-bg.png)",
      }}
    >
      <main className="font-sans flex flex-col min-h-screen md:items-center p-8 md:p-20 pb-20">
        <div className="md:mt-12 md:max-w-4xl w-full">
          <h1 className="text-4xl md:text-6xl font-bold mt-8 drop-shadow-sm">
            Mudacity.
          </h1>
          <p className="md:text-lg mt-4 leading-relaxed">
            Encontre os dados que importam para basear na decisão de mudar para
            um novo Estado.
          </p>
          <div className="flex flex-col mt-8 md:max-w-[50%]">
            <div className="flex-4">
              <div className="flex items-center flex-row gap-4 mt-8">
                <span>Já possuí uma conta?</span>
                <Drawer direction="bottom" open={loginOpen} onOpenChange={(o) => { console.log('drawer open change:', o); setLoginOpen(o); }}>
                  <DrawerTrigger asChild>
                    <Button data-test-id="login-button" className="bg-blue-600 text-white hover:bg-blue-700">
                      Entrar
                    </Button>
                  </DrawerTrigger>
                  <DrawerContent className="p-0 md:max-w-md w-full mx-auto rounded-t-xl md:rounded-lg">
                    <DrawerHeader>
                      <DrawerTitle>Entrar</DrawerTitle>
                      <DrawerDescription>Use suas credenciais para acessar</DrawerDescription>
                    </DrawerHeader>
                    <div className="px-4 pb-4 space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="voce@exemplo.com" required autoComplete="email" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password">Senha</Label>
                        <Input id="password" type="password" placeholder="••••••••" required autoComplete="current-password" />
                      </div>
                    </div>
                    <DrawerFooter>
                      <Button type="submit" className="w-full">Entrar</Button>
                      <DrawerClose asChild>
                        <Button variant="ghost" className="w-full">Cancelar</Button>
                      </DrawerClose>
                    </DrawerFooter>
                  </DrawerContent>
                </Drawer>
              </div>
              <hr className="my-8 border-t border-gray-300" />
              <div className="flex items-center flex-row gap-4 mt-8">
                <span>Caso contrário</span>
                <Drawer direction="bottom" open={registerOpen} onOpenChange={(o) => { console.log('register drawer open change:', o); setRegisterOpen(o); }}>
                  <DrawerTrigger asChild>
                    <Button data-test-id="register-button" className="bg-white text-blue-600 border border-blue-600 hover:bg-blue-50 transition-colors">
                      Registre-se
                    </Button>
                  </DrawerTrigger>
                  <DrawerContent className="p-0 md:max-w-md w-full mx-auto rounded-t-xl md:rounded-lg">
                    <DrawerHeader>
                      <DrawerTitle>Criar conta</DrawerTitle>
                      <DrawerDescription>Informe seus dados para registrar</DrawerDescription>
                    </DrawerHeader>
                    <div className="px-4 pb-4 space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="reg-email">Email</Label>
                        <Input id="reg-email" type="email" placeholder="voce@exemplo.com" required autoComplete="email" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reg-password">Senha</Label>
                        <Input id="reg-password" type="password" placeholder="••••••••" required autoComplete="new-password" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reg-password-confirm">Confirmar senha</Label>
                        <Input id="reg-password-confirm" type="password" placeholder="••••••••" required autoComplete="new-password" />
                      </div>
                    </div>
                    <DrawerFooter>
                      <Button type="submit" className="w-full">Registrar</Button>
                      <DrawerClose asChild>
                        <Button variant="ghost" className="w-full">Cancelar</Button>
                      </DrawerClose>
                    </DrawerFooter>
                  </DrawerContent>
                </Drawer>
              </div>
            </div>
            <div className="flex-4" />
          </div>
        </div>
      </main>
    </div>
  );
}
