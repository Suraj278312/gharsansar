import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={title:'Ghar Sansar | Household & Plastic Products in Bhuj',description:'Shop household, kitchen, plastic, storage and everyday utility products from Ghar Sansar, Bhuj.',icons:{icon:'/favicon.svg'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
