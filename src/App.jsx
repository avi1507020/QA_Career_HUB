import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import PostGenerator from './components/PostGenerator';
import KanbanBoard from './components/KanbanBoard';
import Home from './components/Home';
import Footer from './components/Footer';
import './App.css';

function App() {
  return (
    <Router>
      <Header />
      
      <main className="main-content-full">
        <Routes>
          <Route path="/" element={<Home onOpenLinkedIn={null} />} />
          <Route path="/linkedin-generator" element={<PostGenerator />} />
          <Route path="/job-tracker" element={<KanbanBoard />} />
        </Routes>
      </main>

      <Footer />
    </Router>
  );
}

export default App;
