import { fireEvent, render, screen } from '@testing-library/react';
import { memo, useState } from 'react';
import { describe, expect, it } from 'vitest';

import { createNestedContexts } from '../src/nestedContexts';

describe('createNestedContexts', () => {
  it('基本读取测试，读取全部字段', () => {
    const [TestContexts, useTestContexts] = createNestedContexts({ a: 1, b: 2 });

    function Consumer() {
      const v = useTestContexts('a', 'b');
      v
      return <div data-testid="value">{`${v.a}:${v.b}`}</div>;
    }

    render(
      <TestContexts values={{ a: 10, b: 20 }}>
        <Consumer />
      </TestContexts>,
    );

    expect(screen.getByTestId('value')).toHaveTextContent('10:20');
  });

  it('未包裹 Context 时读取初始默认值', () => {
    const [, useTestContexts] = createNestedContexts({ a: 1 });

    function Consumer() {
      const { a } = useTestContexts('a');
      return <span data-testid="value">{a}</span>;
    }

    render(<Consumer />);

    expect(screen.getByTestId('value')).toHaveTextContent('1');
  });

  it('内层覆盖外层', () => {
    const [TestContexts, useTestContexts] = createNestedContexts({ a: 1 });

    function Consumer() {
      const { a } = useTestContexts('a');
      return <span data-testid="value">{a}</span>;
    }

    render(
      <TestContexts values={{ a: 1 }}>
        <TestContexts values={{ a: 99 }}>
          <Consumer />
        </TestContexts>
      </TestContexts>,
    );

    expect(screen.getByTestId('value')).toHaveTextContent('99');
  });

  it('精确订阅：只更新订阅的 key，其他 key 的消费者不重渲染', () => {
    const [TestContexts, useTestContexts] = createNestedContexts({ a: 1, b: 2 });

    const renders = { a: 0, b: 0 };

    const ConsumerA = memo(() => {
      renders.a += 1;
      const { a } = useTestContexts('a');
      return <span data-testid="a">{a}</span>;
    });

    const ConsumerB = memo(() => {
      renders.b += 1;
      const { b } = useTestContexts('b');
      return <span data-testid="b">{b}</span>;
    });

    function App() {
      const [state, setState] = useState({ a: 1, b: 2 });
      return (
        <>
          <TestContexts values={state}>
            <ConsumerA />
            <ConsumerB />
          </TestContexts>
          <button
            type="button"
            onClick={() => setState((s) => ({ ...s, a: s.a + 1 }))}
          >
            inc-a
          </button>
        </>
      );
    }

    render(<App />);

    const aRendersBefore = renders.a;
    const bRendersBefore = renders.b;

    fireEvent.click(screen.getByRole('button', { name: 'inc-a' }));

    expect(renders.a).toBeGreaterThan(aRendersBefore);
    expect(renders.b).toBe(bRendersBefore);
  });
});
