import Layout from "./components/Layout.tsx";
import 'bootstrap/dist/css/bootstrap.min.css';
import HomePage from "./pages/HomePage.tsx";
function App() {

  return (
      <>
          <Layout>
            <HomePage/>
          </Layout>
      </>
  )
}

export default App
