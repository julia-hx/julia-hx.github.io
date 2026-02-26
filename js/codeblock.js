// Function to get code text from tables, skipping line numbers
const getCodeFromTable = (codeBlock) => {
    return [...codeBlock.querySelectorAll('tr')]
        .map(row => row.querySelector('td:last-child')?.innerText ?? '')
        .join('');
};

// Function to get code text from non-table blocks
const getNonTableCode = (codeBlock) => {
    return codeBlock.textContent.trim();
};

document.addEventListener('DOMContentLoaded', function () {
    // Select all `pre` elements containing `code`

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const pre = entry.target.parentNode;
            const clipboardBtn = pre.querySelector('.clipboard-button');
            const label = pre.querySelector('.code-label');

            if (clipboardBtn) {
                // Adjust the position of the clipboard button when the `code` is not fully visible
                clipboardBtn.style.right = entry.isIntersecting ? '5px' : `-${entry.boundingClientRect.right - pre.clientWidth + 5}px`;
            }

            if (label) {
                // Adjust the position of the label similarly
                label.style.right = entry.isIntersecting ? '0px' : `-${entry.boundingClientRect.right - pre.clientWidth}px`;
            }
        });
    }, {
        root: null, // observing relative to viewport
        rootMargin: '0px',
        threshold: 1.0 // Adjust this to control when the callback fires
    });

    document.querySelectorAll('pre code').forEach(codeBlock => {
        const pre = codeBlock.parentNode;
        pre.style.position = 'relative'; // Ensure parent `pre` can contain absolute elements

        // Create and append the copy button
        const copyBtn = document.createElement('button');
        copyBtn.className = 'clipboard-button';
		copyBtn.style.fontSize = '1.2em';
        copyBtn.innerHTML = '<span>COPY</span>';
        copyBtn.setAttribute('aria-label', 'Copy code to clipboard');
        pre.appendChild(copyBtn);

        // Attach event listener to copy button
        copyBtn.addEventListener('click', async () => {
            // Determine if the code is in a table or not
            const isTable = codeBlock.querySelector('table');
            const codeToCopy = isTable ? getCodeFromTable(codeBlock) : getNonTableCode(codeBlock);
			try {
                await navigator.clipboard.writeText(codeToCopy);
            } catch (error) {
                console.error('Failed to copy text: ', error);
            }
        });

        let ticking = false;
        pre.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
					let offset = pre.scrollLeft < 5 ? 0 : 10;
                    copyBtn.style.right = `-${pre.scrollLeft - offset}px`;
                    ticking = false;
                });
                ticking = true;
            }
        });
    });
});
