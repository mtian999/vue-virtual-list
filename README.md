# vue-virtual-list

vue2 虚拟列表组件，为什么又要写个重复的轮子，因为我用了几款轮子都没有达到我需要的业务功能要求，要不就是不支持高度可变，要不就是高度变化时渲染过于卡顿。
为了解决列表子项高度可改变的痛点，优化性能，于是有了这个轮子。

## Table of contents

- [Advantages](#advantages)
- [Live demo](#live-demo)
- [**Props type**](#props-type)
  - [Required, props](#required-props)
  - [Optional props](#optional-props)
  - [Public methods](#public-methods)
- [Attentions](#attentions)

## Advantages

- 只需要 2 个属性，简单，非常容易使用。

- 大数据列表，渲染性能高，效率高。

- 你不需要关心子项的大小，它会自动计算，渲染效果好。

## Live demo

https://mtian999.github.io/vue-virtual-list/

## Props type

### Required props

| **&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Prop&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;** | **Type** | **Description**                                                             |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | --------------------------------------------------------------------------- |
| `realData`                                                                                                                                                           | Array    | 列表数据，建议冻结（例如：realData="Object.freeze(data)"），减少 Observer。 |
| `keyName`                                                                                                                                                            | String   | 从每个数据对象中的唯一键。它的值在数据源中必须是唯一的。                    |

### Optional props

<details open>
  <summary><strong>Commonly used</strong></summary>
  <p></p>
  <table>
    <tr>
      <th>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Prop&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</th>
      <th>Type</th>
      <th>Default</th>
      <th>Description</th>
    </tr>
    <tr>
      <td><code>isUnfreeze</code></td>
      <td>Boolean</td>
      <td>true</td>
      <td>是否解冻数据</td>
    </tr>
    <tr>
      <td><code>freezeKeyName</code></td>
      <td>[String, Array]</td>
      <td>undefined</td>
      <td>组件卸载时，想要冻结的属性（为空则默认深克隆子项重新赋值，清除子项的全部Observer）</td>
    </tr> 
    <tr>
      <td><code>virtualListHeight</code></td>
      <td>Number|String</td>
      <td>100%</td>
      <td>虚拟列表容器高度</td>
    </tr>
    
  </table>
</details>

### Public methods

<details>
  <summary><strong>Usefull public methods</strong></summary>
  <p></p>
  <p>You can call these methods via <code><a href="https://vuejs.org/v2/guide/components-edge-cases.html#Accessing-Child-Component-Instances-amp-Child-Elements">ref</a></code>:</p>
  <table>
    <tr>
      <th>Method</th>
      <th>props</th>
      <th>Description</th>
    </tr>
    <tr>
      <td><code>scrollToTargetHandle(idx)</code></td>
      <th>idx</th>
      <td>滚动到目标idx</td>
    </tr>
 
  </table>
</details>

## Attentions

个人认为，虚拟列表的性能大户是对象的监听器， Observer 。所以我会清理未渲染组件数据的 Observer 。realData 赋值时请冻结列表数据，然后，如果是只读列表，赋值 isUnfreeze 为 false,则子项数据全部冻结；如果是可编辑列表，赋值 isUnfreeze 为 true，则不冻结子项数据，且子项数据组件卸载后清理子项数据的 Observer。

## Project setup

```
npm install
```

### Compiles and hot-reloads for development

```
npm run serve
```

### Compiles and minifies for production

```
npm run build
```

### Lints and fixes files

```
npm run lint
```

## License

[MIT License](https://github.com/mtian999/vue-virtual-list/blob/master/LICENSE).
