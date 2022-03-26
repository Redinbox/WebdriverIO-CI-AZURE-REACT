import React, { useState } from 'react';

function App() {
  const [count ,setCount] = useState(0)

  const onAddCount = ()=>{
    setCount(count+1)
  }

  return (
    <div className="App">
     <div>
       <button onClick={onAddCount}>Add</button>
     </div>
     <div className='counter'>
       {count}
     </div>
    </div>
  );
}

export default App;
