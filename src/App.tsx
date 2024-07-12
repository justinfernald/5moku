import './App.css';

import { Card } from './components/base';
import TodoList from './components/todo/TodoList';
import TodoListModel from './models/TodoListModel';
import { absolute, flexCenter, fullSize, padding } from './styles';

const todoListStore = new TodoListModel();

function App() {
  return (
    <div css={[absolute(), fullSize, flexCenter]}>
      <Card
        css={[{ width: 'min(90%, 400px)', height: 'min(90%, 400px)' }, padding('xl')]}
      >
        <TodoList store={todoListStore} />
      </Card>
    </div>
  );
}

export default App;
