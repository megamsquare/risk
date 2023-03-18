import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import TokenList from './component/TokenList';
import NoWallet from './component/NoWallet';

function App() {
  return (
    <div className="App">
      <h1>RebaseToken Trading</h1>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<TokenList />}></Route>
          <Route path='/nowallet' element={<NoWallet />}></Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
