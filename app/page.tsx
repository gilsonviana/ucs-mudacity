import Image from "next/image";

export default function Home() {
  return (
    <div
      className="relative min-h-screen w-full bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: 'url(/city-bg.png)',
        backgroundPosition: 'bottom center'
      }}
    >
      <main className="font-sans flex flex-col min-h-screen items-center p-20 md:p-8 pb-20">
        <div className="mt-12 max-w-4xl w-full">
          <h1 className="text-6xl font-bold mt-8 drop-shadow-sm">Mudacity.</h1>
          <p className="text-lg mt-4 leading-relaxed">
            Encontre os dados que importam para basear na decisão de mudar para
            um novo Estado.
          </p>
          <div className="flex flex-row mt-8">
            <div className="flex-4">
              <div className="flex items-center flex-row gap-4 mt-8">
                <span>Já possuí uma conta?</span>
                  <button className="bg-blue-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-blue-700 transition-colors">
                  Entrar
                  </button>
              </div>
              <hr className="my-8 border-t border-gray-300" />
              <div className="flex items-center flex-row gap-4 mt-8">
                <span>Caso contrário</span>
                <button className="bg-white text-blue-600 border border-blue-600 px-6 py-2 rounded-md font-semibold hover:bg-blue-50 transition-colors">
                  Registre-se
                </button>
              </div>
            </div>
            <div className="flex-4" />
          </div>
        </div>
      </main>
    </div>
  );
}
