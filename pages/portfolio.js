import React from 'react'
import Head from 'next/head'
import Header from '../src/Components/Header'
import Portfolio from '../src/Pages/Portfolio'

export default function PortfolioPage(){
  return (
    <>
      <Head>
        <title>Portfolio</title>
      </Head>
      <Header>
        <Portfolio />
      </Header>
    </>
  )
}
