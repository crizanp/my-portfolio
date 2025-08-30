import React from 'react'
import Head from 'next/head'
import Header from '../src/Components/Header'
import Contact from '../src/Pages/Contact'

export default function ContactPage(){
  return (
    <>
      <Head>
        <title>Contact</title>
      </Head>
      <Header>
        <Contact />
      </Header>
    </>
  )
}
