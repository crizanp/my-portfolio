import { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`


::-webkit-scrollbar {
    width: 6px;
    background-color: transparent;
}
::-webkit-scrollbar-thumb {
    background-color: rgba(255,255,255,0.25);
}
::-webkit-scrollbar-thumb {
    /* background-color: rgba(0,0,0,0.5); */
    -webkit-border-radius: 6px;
    border-radius: 6px;
}
::-webkit-scrollbar-track {
    /* -webkit-box-shadow: none; */
    background-color: transparent;
}

h1,
h2,
h3,
h4,
h5,
h6 {
  margin: 0;
  padding: 0;
  font-size: 30px;
  color: rgb(${({ theme }) => theme.title.primary});
  ${'' /* color: #323232; */}
  line-height: 1.4em;
  font-weight: 600;
}

.h-title {
  margin-bottom: 5px;
}

h2 {
  font-size: 1.5rem;
}

h3 {
  font-size: 1.4rem;
}

h4 {
  font-size: 1.25rem;
}

h5 {
  font-size: 1rem;
}

h6 {
  font-size: 0.875rem;
}

p {
  font-size: 1rem;
  line-height: 1.8em;
  padding: 0;
  margin: 0 0 25px 0;
  color: rgb(${({ theme }) => theme.title.secondary})
}

strong {
  font-weight: 600;
}

a {
  color: rgb(${({ theme }) => theme.title.primary});
  text-decoration: none;
}
span{
  color:  ${({ theme }) => theme.title.primary};
}


.card-section{
  &::after{
    background: rgb(49, 49, 58);
    opacity: 0.3;
  }
}

.app {
  position: relative;
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  overflow-x: hidden;
  background: ${({ theme }) => theme.gradient.bgGradient};
  transition: all 0.5s;

  .content .title {
      color: ${({ theme }) => theme.title.primary};;

      &:after {
        background: ${({ theme }) => theme.border.gradient2};
      }

      &:first-letter,
      .first-word {
        color: ${({ theme }) => theme.highlight.primary} !important;
      }
    }

}

.border-line-h:after {
      background: ${({ theme }) => theme.border.gradient2}
    }

    .border-line-v:before {
      background: ${({ theme }) => theme.border.gradient1}
    }

.container {
  position: relative;
  margin: 8vh 6vw;
  top: 0;
  left: 0;
  width: 100%;
  height: auto;
  max-width: 1243px;
  max-height: none;
  transition: all 0.4s ease 0s;
  padding-left: 0;
  padding-right: 0;
}

.link .text,
.button .text {
  transition: all 0.3s ease;
}

.link,
.button {
  position: relative;
  height: 70px;
  font-size: 0.75rem;
  color: ${({ theme }) => theme.title.secondary};
  font-weight: 500;
  text-align: center;
  text-decoration: none;
  text-transform: uppercase;
  border: none;
}

.link,
.button,
input[type="submit"] {
  display: block;
  width: 100%;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.title.secondary};
}
.content {
  position: relative;
  margin: 0 0 40px 0;

  .title {
    position: relative;
    margin: 0 0 0 0;
    padding: 0 0 30px 0;
    font-size: 1.25rem;
    line-height: 21px;
    min-height: 51px;
    font-weight: 600;
    z-index: 2;
    color: rgb(${({ theme }) => theme.title.primary});

    &:after {
      content: "";
      position: absolute;
      width: auto;
      height: 1px;
      background: ${({ theme }) => theme.gradient.gradient3};
    }

    &:after {
      right: 0;
      bottom: 0;
      margin: 0 auto;
      padding: 0 1em;
    }
  }
}

.card-inner {
  background-color: ${({ theme }) => theme.bg.primary};
  padding: 0;
  position: absolute;
  left: 560px;
  right: 0;
  top: 15px;
  bottom: 15px;
  width: auto;
  height: auto;
  border-radius: 0 4px 4px 0;
  transform-origin: center left;
  ${'' /* z-index: 10; */}
  animation: fadeInLeft 1s;

  &:before,
  &:after {
    background: ${({ theme }) => theme.bg.primary};
  }

  &:before,
  &:after {
    height: 30px;
  }

  &:before,
  &:after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 20px;
    height: 20px;
    z-index: 10;
  }

  &:after {
    top: auto;
    bottom: 0;
  }

  .card-wrap {
    height: 100%;
    padding: 30px 30px 0 30px;
    position: relative;
    overflow: auto;
    overflow-x: hidden;
  }
}

.app.light .bg-bubbles li{
    background-color: hsla(0,0%,100%,.1) !important;
  }
  .app.dark .bg-bubbles li{
    background-color: rgba(255, 255, 255, 0.02) !important;
  }

@keyframes fadeInTop {
  0% {
    opacity: 0;
    transform: translate3d(0, -70%, 0);
  }

  100% {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}
@keyframes fadeInLeft {
  0% {
    opacity: 0;
    transform: translate3d(-70%, 0, 0);
  }

  100% {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}

.row .col {
  position: relative;
  display: inline-block;
  vertical-align: top;
}

.row {
  margin: 0 -30px;
  position: relative;
  font-size: 0;
}

.resume-title {
  padding: 0 0 20px 0;
  position: relative;
}

.resume-title .name {
  line-height: 14px;
  color: rgb(${({ theme }) => theme.title.primary});
  font-size: 1.06rem;
  font-weight: 500;
}

.resume-title{
  padding: 0 0 30px 0;



 .name {
  margin: 0 0 0 10px;
  font-weight: 500;
  text-transform: uppercase;
}

 .icon {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  top: -13px;
  float: left;
  width: 40px;
  height: 40px;
  font-size: 2rem;
  color: ${({ theme }) => theme.highlight.primary};
}
}



.resume-items .resume-item p {
  margin: 0;
}

.resume-items .resume-item:last-child:after {
  display: none;
}

.border-line-h:after {
  content: "";
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 1px;
  background: ${({ theme }) => theme.gradient.gradient3};
}

.border-line-v:before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  width: 1px;
  height: 100%;
  background: radial-gradient(ellipse at top,  rgba(197, 202, 213, 0.7) 0%,  rgba(255, 255, 255, 0) 70%);
}
.row .col.border-line-v:first-child:before {
  display: none;
}
ol,
ul,
li {
  list-style: none;
  margin-top: 0px;
  margin-bottom: 0px;
  padding-left: 0px;
}

ul {
  display: block;
  margin-block-start: 1em;
  margin-block-end: 1em;
  margin-inline-start: 0px;
  margin-inline-end: 0px;
  padding-inline-start: 40px;
}

.link:before {
  background: radial-gradient(ellipse at top,  #dddddd 0%,  rgba(255, 255, 255, 0) 70%);
}

.link:before {
  content: "";
  position: absolute;
  right: 0;
  top: 0;
  width: 1px;
  height: 100%;
}

.content .title .first-word,
.content .title:first-letter {
  color: ${({ theme }) => theme.highlight.primary} !important;
}

input[type="text"] ,
textarea,
button {
  margin: 0;
  padding: 0;
  display: block;
  font-family: 'Poppins', sans-serif;
  font-size: 0.8rem;
  width: 100%;
  height: 60px;
  background: none;
  border: none;
  border-bottom: 1px solid ${({ theme }) => theme.highlight.primary};
  border-radius: 0px;
  appearance: none;
  outline: none;
}

.button {
  padding: 0 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: auto;
  height: 50px;
  line-height: 50px;
  border: 1px solid ${({ theme }) => theme.highlight.primary};
  border-radius: 4px;
}

input[type="text"] ,
textarea,
button,
input[type="submit"] {
  padding: 0 15px;
  font-size: 1rem;
  height: 50px;
  color:  rgb(${({ theme }) => theme.title.primary});
}

input:focus,
textarea:focus {
  color:  rgb(${({ theme }) => theme.title.primary});
  border-bottom: 2px solid ${({ theme }) => theme.highlight.primary};
}

textarea {
  height: 94px;
}

.card-wrap .content.contacts .row .row .col.col-6:nth-child(1) {
  padding-right: 15px;
}

.card-wrap .content.contacts .row .row .col {
  padding-bottom: 30px;
}

.align-left {
  text-align: left !important;
}

.f-container {
  position: relative;
  max-width: 110rem;
  padding: 0 100px;
}



@media (max-width: 920px) {
  .f-container {
    max-width: 130rem;
    padding: 0 3.2rem;
  }

}

col {
  display: block;
}

@media (max-width: 560px) {
  .container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin-top: 60px;
    padding-bottom: 10px;
  }
}

@media (min-width: 560px) and (max-width: 1199px) {
  .container {
    margin: 0 auto;
    padding: 0 15px 0 100px;
    margin-bottom: 10px;
  }
}

@media (max-width: 1199px) {
  .container {
    position: relative;
    top: 60px;
    left: 0;
    width: auto;
    height: auto;
    max-width: 700px;
    max-height: initial;
    transform: none;
  }
}

@media (min-width: 1199px) and (max-width: 1300px) {
  .container {
    margin: 5vh 3vw;
  }
}

@media (max-width: 1199px) {
  .app {
  height: auto;
  display: block;
  /* allow vertical scrolling on small devices */
  overflow: auto;
  }
}

@media (max-width: 1199px) {
  .card-section {
    position: relative;
    float: none;
    width: 100%;
    height: 600px;

    .profile {
      padding-top: 50px;
      min-height: 560px;
      height: calc(100vh - 102px);
       

      .slide {
        height: 55%;
      }
    }
  }

  .card-inner {
    display: flex;
    position: relative;
    flex-shrink: unset;
    margin: 15px 0;
    left: 0;
    width: 100%;
    height: 600px;
    border-radius: 4px;
    z-index: 10;
    animation: fadeInTop 1s;
    .card-wrap {
      height: auto;
    }
  }
}

/* mobile-specific: make inner card and wrap fully scrollable */
@media (max-width: 560px) {
  .app {
    overflow: auto !important;
    height: auto !important;
  }
  .card-inner {
    position: relative !important;
    left: 0 !important;
    right: 0 !important;
    width: 100% !important;
    height: auto !important;
    max-height: none !important;
    border-radius: 0 0 4px 0 !important;
  }
  .card-inner .card-wrap {
    height: auto !important;
    max-height: none !important;
    overflow: auto !important;
  }
  /* allow the private grid to scroll independently if needed */
  .private-grid {
    max-height: calc(100vh - 240px) !important;
    overflow-y: auto !important;
  }
}


a:hover {
  color: ${({ theme }) => theme.highlight.primary};
}

.row .col {
  padding: 30px;
  font-size: 1rem;
}

.skills .grid-items {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  .grid-item {
    position: relative;
    margin-top: 10px;
  }
}
@media (min-width: 560px){
  .skills .grid-items {
    .grid-item {
      padding: 0 15px;
    }
  }
}
@media (max-width: 559px){
  .skills .grid-items {
    .grid-item {
      justify-content: center;
      .cards{
        margin: 10px;
      }
    }
  }
}

.grid-item {
  position: relative;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  padding: 0 10px;
  align-items: center;
}


.menu-btn .nav-link{
  height: auto;
  &::before{
      content:unset;
  }
}
/* When the app has the class 'hide-profile' we hide the left profile card
  and expand the main content (.card-inner) to take the full available area.
  Private page will toggle this class when the user is authenticated. */
.hide-profile .card-section {
  display: none !important;
}
.hide-profile .card-inner {
  left: 72px !important; /* leave space for the left navbar */
  right: 0 !important;
  width: auto !important;
  border-radius: 4px !important;
}

/* Private page category row and grid */
.category-row {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
  margin-top: 12px;
}
.private-grid {
  max-height: calc(100vh - 320px);
  overflow-y: auto;
  padding-right: 8px;
  margin-top: 12px;
}

/* default: 3 columns on desktop */
.private-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

/* mobile: 1 column */
@media (max-width: 560px) {
  .private-grid {
    grid-template-columns: 1fr;
    gap: 12px;
    padding-right: 0;
  }
  .private-grid > div {
    padding: 12px !important;
  }
}

@media (max-width: 760px) {
  .category-row {
    grid-template-columns: repeat(3, 1fr);
  }
  .private-grid {
    max-height: calc(100vh - 360px);
  }
}

/* tool card styling used on Tools page */
.tool-card {
  display: block;
  padding: 16px;
  background: #f4ecff;
  border-radius: 8px;
  text-decoration: none;
  color: inherit;
  box-shadow: 0 6px 18px rgba(0,0,0,0.04);
}

@media (min-width: 760px) {
  .category-row {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 560px) {
  .category-row {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}

/* subtool grid used on ToolDetail - 2 columns desktop, 1 on mobile */
.subtool-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}
@media (max-width: 760px) {
  .subtool-grid {
    grid-template-columns: 1fr;
  }
}

/* tools page header styling */
.tools-header {
  font-size: 1.35rem;
  font-weight: 700;
  margin: 0 auto 6px auto;
  text-align: center;
  color: rgb(${({ theme }) => theme.title.primary});
  letter-spacing: 0.2px;
  max-width: 900px;
}
.tools-subtitle {
  font-size: 0.98rem;
  color: rgba(0,0,0,0.55);
  margin: 0 auto 18px auto;
  text-align: center;
  max-width: 820px;
  line-height: 1.5;
  opacity: 0.95;
}
.tool-card {
  display: block;
  padding: 16px;
  background: #f4ecff;
  border-radius: 8px;
  text-decoration: none;
  color: inherit;
  box-shadow: 0 6px 18px rgba(0,0,0,0.04);
  transition: transform 160ms ease, box-shadow 160ms ease;
  position: relative;
  overflow: visible; /* allow badge to sit outside without clipping */
}
.tool-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 30px rgba(0,0,0,0.08);
}
.tool-card div { /* increase spacing inside cards */
  line-height: 1.45;
}

.tool-card-sub {
  font-size: 12px;
  color: rgba(0,0,0,0.65); /* dark tone */
  margin-top: 8px;
  text-align: left;
}

.featured-badge {
  position: absolute;
  right: 12px;
  top: 12px;
  background: rgba(255,255,255,0.95);
  color: #ffd166;
  padding: 4px 6px;
  border-radius: 6px;
  font-weight: 700;
  box-shadow: 0 2px 6px rgba(0,0,0,0.08);
  font-size: 0.85rem;
  z-index: 60;
  transform: none !important;
}

/* On small screens remove the left offset applied by .hide-profile so
   the main card takes the full width (hide the 72px gap only on mobile) */
@media (max-width: 560px) {
  .hide-profile .card-inner {
    left: 0 !important;
    right: 0 !important;
    width: 100% !important;
    border-radius: 4px !important;
    margin: 0 0 10px 0 !important;
  }
}
`