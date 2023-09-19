import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export default function MainLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body className={`min-h-full`}>
                <header className="flex justify-center content-center">
                    <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
                        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
                            <code className="font-mono font-bold">Er. </code>
                            Ajay Singh
                        </p>
                    </div>
                </header>
                {children}
                <footer>
                    <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:h-auto lg:w-auto lg:bg-none">
                        copyright@2023. All the rights are reserved.
                    </div>
                </footer>
            </body>
        </html>
    )
}
