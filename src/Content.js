import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Portfolio from "./Pages/Portfolio";
import Resume from "./Pages/Resume";
import About from "./Pages/About";
import Home from "./Pages/Home";
import Footer from "./Components/Footer";
import ErrorPage from "./Pages/ErrorPage";
import AOS from "aos";
import "aos/dist/aos.css";
import Contact from "./Pages/Contact";
import Header from "./Components/Header";
import Login from "./Pages/Login";
import Private from "./Pages/Private";
import Tools from "./Pages/Tools";
import ToolDetail from "./Pages/ToolDetail";
import ToolRunner from "./Pages/ToolRunner";
import AIModals from "./Pages/AIModals";
import AIToolDetail from "./Pages/AIToolDetail";
import ExamTimerPrep from "./Pages/ai-project/exam-timer-and-preperation-tracker";
import TextEncrypt from "./Pages/TextEncrypt";
import TextDecrypt from "./Pages/TextDecrypt";


AOS.init({
  once: true,
  duration: 1000,
  offset: -200,
});


const Content = () =>{
  

  return (
     <BrowserRouter>
      <>
        <div className="container">
          <Routes>
            <Route path="/" element={<Header />}>
              <Route path="/" element={<Home />}>
                <Route index element={<About />} />
                <Route path="/about" element={<About />} />
                <Route path="/portfolio" element={<Portfolio />} />
                <Route path="/resume" element={<Resume />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/login" element={<Login />} />
                <Route path="/private" element={<Private />} />
                <Route path="/tools" element={<Tools />} />
                <Route path="/tools/:id" element={<ToolDetail />} />
                <Route path="/tools/:category/:subtool" element={<ToolRunner />} />
                <Route path="/ai" element={<AIModals />} />
                <Route path="/ai/exam-timer-and-preperation-tracker" element={<ExamTimerPrep />} />
                <Route path="/ai/:id" element={<AIToolDetail />} />
              </Route>
            </Route>
            <Route path="*" element={<ErrorPage />} />
          </Routes>
        </div>
      </>
      <Footer />
    </BrowserRouter>

  );
}

export default Content;
