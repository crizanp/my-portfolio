import React from 'react'
import Head from 'next/head'
import Header from '../src/Components/Header'
import About from '../src/Pages/About'

export default function AboutPage(){
  return (
    <>
      <Head>
        <title>About</title>
      </Head>
      <Header>
        <About />
      </Header>
    </>
  )
}
