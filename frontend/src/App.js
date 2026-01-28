import React, { useState } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import MarginCalculator from './margin/MarginCalculator';
import OrderManager from './order/OrderManager';
import AlbumUpload from './AlbumUpload/AlbumUpload';
import OnlineUpload from "./OnlineUpload/OnlineUpload";
import UploadTab from './components/UploadTab';
import TabNavigation from './components/TabNavigation';

function App() {
  const [activeTab, setActiveTab] = useState("order");

  return (
    <div>
      <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

      {activeTab === "upload" && <UploadTab />}
      {activeTab === "online" && <OnlineUpload />}
      {activeTab === "album" && <AlbumUpload />}
      {activeTab === "margin" && <MarginCalculator />}
      {activeTab === "order" && <OrderManager />}
      
      <ToastContainer />
    </div>
  );
}

export default App;
