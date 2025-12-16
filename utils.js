function destroyChildren(container) {
    for (let i = container.children.length - 1; i >= 0; i--) {
        container.children[i].destroy({ children: true });
    }
    container.removeChildren();
}