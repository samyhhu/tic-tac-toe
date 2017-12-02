module.exports = assert => ({
    equal: (actual, expected) => {
        assert.equal(actual.valueOf(), expected.valueOf());
    },
    isTrue: assert.isTrue,
    isFalse: assert.isFalse,
    throws: promise => {
        return promise.then(assert.fail, () => true);
    },
});
