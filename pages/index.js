import React from 'react'
import Head from 'next/head'
import Header from '../src/Components/Header'
import Home from '../src/Pages/Home'

export default function IndexPage() {
  return (
    <>
      <Head>
        <title>Portfolio - Home</title>
      </Head>
      <Header>
        <Home />
      </Header>
    </>
  )
}
