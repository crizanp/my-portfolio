import React from 'react'
import Head from 'next/head'
import Header from '../src/Components/Header'
import Resume from '../src/Pages/Resume'

export default function ResumePage(){
  return (
    <>
      <Head>
        <title>Resume</title>
      </Head>
      <Header>
        <Resume />
      </Header>
    </>
  )
}
